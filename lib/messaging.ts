import { defineExtensionMessaging } from '@webext-core/messaging';

export interface SetWebsiteIconData {
  icon: string;
  /**
   * The favicon the page had before the custom icon was applied. Only used for
   * pages without a `<link rel="icon">` of their own.
   */
  originalIcon?: string;
}

interface ProtocolMap {
  /** Apply a custom icon to the content script's page. */
  setWebsiteIcon(data: SetWebsiteIconData): boolean;
  /** Restore the page's original favicon and return its URL, if known. */
  clearWebsiteIcon(originalIcon?: string): string | null;
  /** Used to detect whether the content script is already injected. */
  ping(): boolean;
}

export const { sendMessage, onMessage } = defineExtensionMessaging<ProtocolMap>();
