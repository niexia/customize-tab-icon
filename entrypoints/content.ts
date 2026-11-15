import { onMessage } from '@/lib/messaging';
import { clearFavicon, setFavicon } from '@/lib/favicon-dom';
import {
  getEffectiveIcon,
  getEffectiveOriginalIcon,
  migrateLegacyIcons,
  watchDomainIcon,
  watchPageIcon,
} from '@/lib/icons';
import { log } from '@/lib/utils';

const INJECTED_FLAG = '__changiconContentLoaded';

export default defineContentScript({
  matches: ['*://*/*'],
  main(ctx) {
    const pageWindow = window as unknown as Record<string, unknown>;

    // The popup injects this same script into tabs that were open before the
    // extension was installed/updated. Don't register everything twice.
    if (pageWindow[INJECTED_FLAG]) return;
    pageWindow[INJECTED_FLAG] = true;

    let currentIcon: string | null = null;
    let unwatchPageIcon: (() => void) | null = null;
    let unwatchDomainIcon: (() => void) | null = null;
    let observer: MutationObserver | null = null;

    const applyCurrentIcon = async () => {
      try {
        const [icon, originalIcon] = await Promise.all([
          getEffectiveIcon(window.location.href),
          getEffectiveOriginalIcon(window.location.href).catch(() => null),
        ]);

        currentIcon = icon;

        if (icon) {
          setFavicon(icon, document, originalIcon);
        } else {
          clearFavicon(document, originalIcon);
        }
      } catch (error) {
        log('error', 'Failed to apply the tab icon', error);
      }
    };

    const refreshFromStorage = () => {
      void applyCurrentIcon();
    };

    const watchCurrentPage = () => {
      unwatchPageIcon?.();
      unwatchDomainIcon?.();

      unwatchPageIcon = watchPageIcon(window.location.href, refreshFromStorage);
      unwatchDomainIcon = watchDomainIcon(window.location.href, refreshFromStorage);
    };

    const applyIconForCurrentUrl = async () => {
      await applyCurrentIcon();

      // The SPA / other tab may change the URL, so keep the watcher in sync.
      watchCurrentPage();
    };

    const startObserver = () => {
      if (observer) return;

      observer = new MutationObserver(() => {
        if (!currentIcon) return;

        const siteChangedIcon = Array.from(
          document.querySelectorAll<HTMLLinkElement>('link[rel~="icon"]'),
        ).some((link) => link.getAttribute('href') !== currentIcon);

        // The site (or its router) replaced the favicon; apply ours again.
        if (siteChangedIcon) {
          setFavicon(currentIcon);
        }
      });

      observer.observe(document.head ?? document.documentElement, {
        subtree: true,
        childList: true,
        attributes: true,
        attributeFilter: ['href', 'rel'],
      });
    };

    onMessage('setWebsiteIcon', (message) => {
      currentIcon = message.data.icon;
      setFavicon(message.data.icon, document, message.data.originalIcon);
      return true;
    });

    onMessage('clearWebsiteIcon', async (message) => {
      currentIcon = null;

      const originalIcon =
        message.data ?? (await getEffectiveOriginalIcon(window.location.href).catch(() => null));

      return clearFavicon(document, originalIcon);
    });

    onMessage('ping', () => true);

    ctx.addEventListener(window, 'wxt:locationchange', () => {
      void applyIconForCurrentUrl();
    });

    ctx.onInvalidated(() => {
      observer?.disconnect();
      observer = null;
      unwatchPageIcon?.();
      unwatchDomainIcon?.();
      unwatchPageIcon = null;
      unwatchDomainIcon = null;
    });

    void (async () => {
      await migrateLegacyIcons();
      await applyIconForCurrentUrl();
      startObserver();
    })();
  },
});
