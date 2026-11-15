import { defineExtensionMessaging } from '@webext-core/messaging';

interface ProtocolMap {
  /** Apply a custom icon to the content script's page. */
  setWebsiteIcon(icon: string): boolean;
  /** Restore the page's original favicon and return its URL, if known. */
  clearWebsiteIcon(): string | null;
  /** Used to detect whether the content script is already injected. */
  ping(): boolean;
}

export const { sendMessage, onMessage } = defineExtensionMessaging<ProtocolMap>();
