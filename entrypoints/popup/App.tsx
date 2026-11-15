import { useCallback, useEffect, useState } from 'react';
import './App.css';
import { ThemeProvider } from '@/components/theme-provider';
import { IconSettingsProvider } from '@/components/icon-settings-provider';
import { SettingsPanel } from '@/components/settings-panel';
import { Header } from '@/components/header';
import { IconDisplay } from '@/components/icon-display';
import { SettingIcon } from '@/components/setting-icon';
import { Contact } from '@/components/contact';
import { sendMessage } from '@/lib/messaging';
import {
  clearAllIcons,
  getOriginalIcon,
  getPageIcon,
  migrateLegacyIcons,
  removePageIcon,
  setOriginalIcon,
  setPageIcon,
} from '@/lib/icons';
import { isSupportedUrl } from '@/lib/icon-key';
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

function App() {
  const [icon, setIcon] = useState('');
  const [tab, setTab] = useState<chrome.tabs.Tab | null>(null);
  const [loading, setLoading] = useState(true);
  const [supported, setSupported] = useState(true);
  const [hasCustomIcon, setHasCustomIcon] = useState(false);
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

        const customIcon = await getPageIcon(activeTab.url);
        if (cancelled) return;

        setHasCustomIcon(Boolean(customIcon));
        setIcon(customIcon ?? activeTab.favIconUrl ?? '');
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

      try {
        // Remember the favicon the page had before the first custom icon.
        // Pages without an icon link need this to restore the tab icon on reset.
        const existingIcon = await getPageIcon(tab.url);
        const originalIcon =
          !existingIcon && tab.favIconUrl && tab.favIconUrl !== value
            ? tab.favIconUrl
            : undefined;

        if (originalIcon) {
          await setOriginalIcon(tab.url, originalIcon);
        }

        // Persist first so the content script (or a freshly injected one)
        // picks the icon up when it initializes.
        await setPageIcon(tab.url, value);
        await sendToTab(tab.id, () =>
          sendMessage('setWebsiteIcon', { icon: value, originalIcon }, tab.id),
        );

        setIcon(value);
        setHasCustomIcon(true);
        setError(null);
      } catch (applyError) {
        await removePageIcon(tab.url).catch(() => undefined);
        log('error', 'Failed to apply the icon', applyError);
        setError('Could not apply the icon to this page. Try refreshing it and retry.');
      }
    },
    [supported, tab],
  );

  const resetIcon = useCallback(async () => {
    if (!tab?.id || !tab.url || !supported) return;

    try {
      const originalIcon = await getOriginalIcon(tab.url).catch(() => null);

      // Tell the page before removing the stored icon, so it can restore the
      // original favicon instead of relying on a storage watcher that no longer
      // knows which favicon the page had.
      const restoredIcon = await sendToTab(tab.id, () =>
        sendMessage('clearWebsiteIcon', originalIcon ?? undefined, tab.id),
      );

      await removePageIcon(tab.url);

      setIcon(restoredIcon ?? originalIcon ?? tab.favIconUrl ?? '');
      setHasCustomIcon(false);
      setError(null);
    } catch (resetError) {
      log('error', 'Failed to reset the icon', resetError);
      setError('Could not reset the icon on this page. Try refreshing it and retry.');
    }
  }, [supported, tab]);

  const clearAll = useCallback(async () => {
    try {
      const originalIcon = tab?.url ? await getOriginalIcon(tab.url).catch(() => null) : null;

      await clearAllIcons();

      const restoredIcon =
        tab?.id && supported
          ? await sendToTab(tab.id, () =>
              sendMessage('clearWebsiteIcon', originalIcon ?? undefined, tab.id),
            ).catch(() => null)
          : null;

      setHasCustomIcon(false);
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
      <IconSettingsProvider>
        <Header />
        <IconDisplay
          icon={icon}
          loading={loading}
          canReset={hasCustomIcon}
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
      </IconSettingsProvider>
    </ThemeProvider>
  );
}

export default App;
