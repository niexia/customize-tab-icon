/**
 * Pure helpers shared by the popup and content scripts.
 *
 * Kept free of browser/storage imports so they can be unit tested.
 */

export type IconStorageKey = `local:icon:${string}`;
export type OriginalIconStorageKey = `local:icon-original:${string}`;

export const ICON_KEY_PREFIX = 'local:icon:';
export const ORIGINAL_ICON_KEY_PREFIX = 'local:icon-original:';

/** Old storage format: `{ [host]: { [pathname]: { customIcon } } }` */
export const LEGACY_ICON_KEY = 'local:changicon-local';
export const LEGACY_MIGRATION_KEY = 'local:icons-migrated-v2';

/**
 * Only regular web pages can be modified. Browser pages (`chrome://`),
 * extension pages and the Web Store cannot run content scripts.
 */
export function isSupportedUrl(url?: string | null): boolean {
  if (!url) return false;

  try {
    const { protocol } = new URL(url);
    return protocol === 'http:' || protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * One storage entry per host + pathname.
 *
 * `host` includes the port, and the protocol is intentionally ignored so
 * `http://` and `https://` share the same icon.
 */
export function createIconStorageKey(host: string, pathname: string): IconStorageKey {
  return `${ICON_KEY_PREFIX}${host}${pathname}`;
}

export function getIconStorageKey(url: string | URL): IconStorageKey {
  const parsed = typeof url === 'string' ? new URL(url) : url;
  return createIconStorageKey(parsed.host, parsed.pathname);
}

export function getOriginalIconStorageKey(url: string | URL): OriginalIconStorageKey {
  const parsed = typeof url === 'string' ? new URL(url) : url;
  return `${ORIGINAL_ICON_KEY_PREFIX}${parsed.host}${parsed.pathname}`;
}
