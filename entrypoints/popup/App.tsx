import { useCallback, useEffect, useState } from 'react';
import './App.css';
import { ThemeProvider } from '@/components/theme-provider';
import { SettingsPanel } from '@/components/settings-panel';
import { Header } from '@/components/header';
import { IconDisplay } from '@/components/icon-display';
import { SettingIcon } from '@/components/setting-icon';
import { Contact } from '@/components/contact';
import { sendMessage } from '@/lib/messaging';
import { useIconSettings } from '@/components/icon-settings-context';
import {
  clearAllIcons,
  getDomainIcon,
  getEffectiveIcon,
  getEffectiveOriginalIcon,
  getPageIcon,
  migrateLegacyIcons,
  removeDomainIcon,
  removePageIcon,
  removePageIconsForSite,
  setDomainIcon,
  setDomainOriginalIcon,
  setOriginalIcon,
  setPageIcon,
} from '@/lib/icons';
import {
  getIconStorageKey,
  getSiteHost,
  isSupportedUrl,
  type IconScope,
} from '@/lib/icon-key';
import { log } from '@/lib/utils';

/**
 * Tabs that were already open before the extension was installed/updated do
 * not have the declarative content script yet. Inject it on demand.
 */
async function injectContentScript(tabId: number): Promise<void> {
  const files = (chrome.runtime.getManifest().content_scripts ?? []).flatMap(
    (script) => script.js ?? [],
  );

  if (files.length === 0) {
    throw new Error('No content script available');
  }

  if (typeof chrome.scripting?.executeScript !== 'function') {
    throw new Error('Scripting is not available in this browser');
  }

  await chrome.scripting.executeScript({ target: { tabId }, files });
}

async function sendToTab<T>(tabId: number, send: () => Promise<T>): Promise<T> {
  try {
    return await send();
  } catch {
    await injectContentScript(tabId);
    return await send();
  }
}

/**
 * Push the stored icon to tabs that are already open. This is needed when a
 * tab was loaded before the extension was installed/updated and therefore
 * does not have the current storage watchers.
 */
async function syncMatchingTabs(
  currentTabId: number,
  targetUrl: string,
  scope: IconScope,
): Promise<void> {
  try {
    const siteHost = getSiteHost(targetUrl);
    const targetKey = getIconStorageKey(targetUrl);
    const tabs = await chrome.tabs.query({});

    const matchingTabs = tabs.filter((tab) => {
      if (!tab.id || tab.id === currentTabId || !tab.url || !isSupportedUrl(tab.url)) {
        return false;
      }

      return scope === 'domain'
        ? getSiteHost(tab.url) === siteHost
        : getIconStorageKey(tab.url) === targetKey;
    });

    await Promise.all(
      matchingTabs.map(async (tab) => {
        const tabId = tab.id;
        const url = tab.url;
        if (!tabId || !url) return;

        try {
          const icon = await getEffectiveIcon(url);
          const originalIcon = await getEffectiveOriginalIcon(url).catch(() => null);

          if (icon) {
            await sendToTab(tabId, () =>
              sendMessage(
                'setWebsiteIcon',
                { icon, originalIcon: originalIcon ?? undefined },
                tabId,
              ),
            );
          } else {
            await sendToTab(tabId, () =>
              sendMessage('clearWebsiteIcon', originalIcon ?? undefined, tabId),
            );
          }
        } catch (error) {
          log('warn', 'Failed to sync an open tab', error);
        }
      }),
    );
  } catch (error) {
    log('warn', 'Failed to sync open tabs', error);
  }
}

function App() {
  const [icon, setIcon] = useState('');
  const [tab, setTab] = useState<chrome.tabs.Tab | null>(null);
  const [loading, setLoading] = useState(true);
  const [supported, setSupported] = useState(true);
  const { scope } = useIconSettings();
  const [iconSource, setIconSource] = useState<IconScope | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        await migrateLegacyIcons();

        const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (cancelled) return;

        if (!activeTab?.id || !activeTab.url) {
          setSupported(false);
          setError('No active tab found.');
          return;
        }

        setTab(activeTab);

        if (!isSupportedUrl(activeTab.url)) {
          setSupported(false);
          return;
        }

        const pageIcon = await getPageIcon(activeTab.url);
        const domainIcon = pageIcon ? null : await getDomainIcon(activeTab.url);
        if (cancelled) return;

        const source = pageIcon ? 'page' : domainIcon ? 'domain' : null;
        setIconSource(source);
        setIcon(pageIcon ?? domainIcon ?? activeTab.favIconUrl ?? '');
      } catch (loadError) {
        log('error', 'Failed to load the current tab', loadError);
        if (!cancelled) {
          setSupported(false);
          setError('Could not read the current tab.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  const applyIcon = useCallback(
    async (value?: string) => {
      if (!value || !tab?.id || !tab.url || !supported) return;

      let previousIcon: string | null = null;

      try {
        // Remember the favicon the page had before the first custom icon.
        // Pages without an icon link need this to restore the tab icon on reset.
        const existingIcon = await getEffectiveIcon(tab.url);
        const existingOriginal = await getEffectiveOriginalIcon(tab.url).catch(() => null);
        previousIcon =
          scope === 'domain'
            ? await getDomainIcon(tab.url).catch(() => null)
            : await getPageIcon(tab.url).catch(() => null);
        const originalIcon =
          existingOriginal ??
          (!existingIcon && tab.favIconUrl && tab.favIconUrl !== value
            ? tab.favIconUrl
            : undefined);

        if (scope === 'domain') {
          if (originalIcon) {
            await setDomainOriginalIcon(tab.url, originalIcon);
          }

          // Store the site icon first so other open tabs update immediately.
          await setDomainIcon(tab.url, value);
          await sendToTab(tab.id, () =>
            sendMessage('setWebsiteIcon', { icon: value, originalIcon }, tab.id),
          );

          // "Whole site" means this icon replaces existing page overrides for
          // the host. Do it after the active tab has been updated successfully.
          await removePageIconsForSite(tab.url);
        } else {
          if (originalIcon) {
            await setOriginalIcon(tab.url, originalIcon);
          }

          await setPageIcon(tab.url, value);
          await sendToTab(tab.id, () =>
            sendMessage('setWebsiteIcon', { icon: value, originalIcon }, tab.id),
          );
        }

        await syncMatchingTabs(tab.id, tab.url, scope);

        setIcon(value);
        setIconSource(scope);
        setError(null);
      } catch (applyError) {
        if (scope === 'domain') {
          if (previousIcon) {
            await setDomainIcon(tab.url, previousIcon).catch(() => undefined);
          } else {
            await removeDomainIcon(tab.url).catch(() => undefined);
          }
        } else if (previousIcon) {
          await setPageIcon(tab.url, previousIcon).catch(() => undefined);
        } else {
          await removePageIcon(tab.url).catch(() => undefined);
        }
        log('error', 'Failed to apply the icon', applyError);
        setError('Could not apply the icon to this page. Try refreshing it and retry.');
      }
    },
    [scope, supported, tab],
  );

  const resetIcon = useCallback(async () => {
    if (!tab?.id || !tab.url || !supported) return;

    try {
      const pageIcon = await getPageIcon(tab.url).catch(() => null);
      const domainIcon = pageIcon ? null : await getDomainIcon(tab.url).catch(() => null);

      if (!pageIcon && !domainIcon) {
        setIconSource(null);
        return;
      }

      const originalIcon = await getEffectiveOriginalIcon(tab.url).catch(() => null);

      // Tell the page before removing the stored icon, so it can restore the
      // original favicon instead of relying on a storage watcher that no longer
      // knows which favicon the page had.
      const restoredIcon = await sendToTab(tab.id, () =>
        sendMessage('clearWebsiteIcon', originalIcon ?? undefined, tab.id),
      );

      if (pageIcon) {
        await removePageIcon(tab.url);
      } else {
        await removeDomainIcon(tab.url);
      }

      // Removing a page override may reveal an icon for the whole site.
      const fallbackIcon = pageIcon ? await getDomainIcon(tab.url).catch(() => null) : null;

      if (fallbackIcon) {
        await sendToTab(tab.id, () =>
          sendMessage(
            'setWebsiteIcon',
            { icon: fallbackIcon, originalIcon: originalIcon ?? undefined },
            tab.id,
          ),
        );
      }

      await syncMatchingTabs(tab.id, tab.url, pageIcon ? 'page' : 'domain');

      setIcon(fallbackIcon ?? restoredIcon ?? originalIcon ?? tab.favIconUrl ?? '');
      setIconSource(fallbackIcon ? 'domain' : null);
      setError(null);
    } catch (resetError) {
      log('error', 'Failed to reset the icon', resetError);
      setError('Could not reset the icon on this page. Try refreshing it and retry.');
    }
  }, [supported, tab]);

  const clearAll = useCallback(async () => {
    try {
      const originalIcon = tab?.url ? await getEffectiveOriginalIcon(tab.url).catch(() => null) : null;

      await clearAllIcons();

      const restoredIcon =
        tab?.id && supported
          ? await sendToTab(tab.id, () =>
              sendMessage('clearWebsiteIcon', originalIcon ?? undefined, tab.id),
            ).catch(() => null)
          : null;

      if (tab?.id && tab.url) {
        await syncMatchingTabs(tab.id, tab.url, 'domain');
      }

      setIconSource(null);
      setIcon(restoredIcon ?? originalIcon ?? tab?.favIconUrl ?? '');
      setError(null);
    } catch (clearError) {
      log('error', 'Failed to clear all icons', clearError);
      setError('Could not clear the saved icons.');
    }
  }, [supported, tab]);

  const hint = supported ? 'Open a web page to get started' : "This page can't be customized";

  return (
    <ThemeProvider>
      <Header />
      <IconDisplay
        icon={icon}
        loading={loading}
        source={iconSource}
        hint={hint}
        onReset={resetIcon}
      />
      {supported ? <SettingIcon onIconChange={applyIcon} /> : null}
      <SettingsPanel />
      {error ? (
        <p role="alert" className="px-4 pb-2 text-xs text-destructive">
          {error}
        </p>
      ) : null}
      <Contact onClearAll={clearAll} />
    </ThemeProvider>
  );
}

export default App;
