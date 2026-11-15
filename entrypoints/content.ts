import { onMessage } from '@/lib/messaging';
import { clearFavicon, setFavicon } from '@/lib/favicon-dom';
import {
  getOriginalIcon,
  getPageIcon,
  migrateLegacyIcons,
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
    let unwatchIcon: (() => void) | null = null;
    let observer: MutationObserver | null = null;

    const watchCurrentPage = () => {
      unwatchIcon?.();
      unwatchIcon = watchPageIcon(window.location.href, (icon) => {
        currentIcon = icon;

        void (async () => {
          const originalIcon = await getOriginalIcon(window.location.href).catch(() => null);

          if (icon) {
            setFavicon(icon, document, originalIcon);
          } else {
            clearFavicon(document, originalIcon);
          }
        })();
      });
    };

    const applyIconForCurrentUrl = async () => {
      try {
        const [icon, originalIcon] = await Promise.all([
          getPageIcon(window.location.href),
          getOriginalIcon(window.location.href).catch(() => null),
        ]);

        currentIcon = icon;

        if (icon) {
          setFavicon(icon, document, originalIcon);
        } else {
          clearFavicon(document, originalIcon);
        }

        // The SPA / other tab may change the URL, so keep the watcher in sync.
        watchCurrentPage();
      } catch (error) {
        log('error', 'Failed to apply the tab icon', error);
      }
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
        message.data ?? (await getOriginalIcon(window.location.href).catch(() => null));

      return clearFavicon(document, originalIcon);
    });

    onMessage('ping', () => true);

    ctx.addEventListener(window, 'wxt:locationchange', () => {
      void applyIconForCurrentUrl();
    });

    ctx.onInvalidated(() => {
      observer?.disconnect();
      observer = null;
      unwatchIcon?.();
      unwatchIcon = null;
    });

    void (async () => {
      await migrateLegacyIcons();
      await applyIconForCurrentUrl();
      startObserver();
    })();
  },
});
