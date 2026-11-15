import { storage } from 'wxt/utils/storage';
import {
  createIconStorageKey,
  DOMAIN_SCOPE_MIGRATION_KEY,
  getDomainIconStorageKey,
  getDomainOriginalIconStorageKey,
  getIconStorageKey,
  getOriginalIconStorageKey,
  getSiteHost,
  getSiteHostFromHost,
  LEGACY_ICON_KEY,
  LEGACY_MIGRATION_KEY,
  type IconStorageKey,
} from './icon-key';
import { log } from './utils';

interface LegacyIconInfo {
  customIcon?: string;
}

type LegacyIconMap = Record<string, Record<string, LegacyIconInfo>>;

let migrationPromise: Promise<void> | null = null;

/**
 * Domain icons used to be keyed by the exact host. Move them to the
 * registrable-domain key so `news.example.com` and `example.com` share one
 * site icon.
 */
async function migrateDomainScopeIcons(): Promise<void> {
  const alreadyMigrated = await storage.getItem<boolean>(DOMAIN_SCOPE_MIGRATION_KEY);
  if (alreadyMigrated) return;

  const local = await storage.snapshot('local');
  const updates: Array<{ key: `local:${string}`; value: string }> = [];
  const removals: Array<`local:${string}`> = [];

  for (const [key, value] of Object.entries(local)) {
    if (key.endsWith('$') || typeof value !== 'string' || !value) continue;

    let prefix: string | null = null;
    if (key.startsWith('icon-domain:')) {
      prefix = 'icon-domain:';
    } else if (key.startsWith('icon-original-domain:')) {
      prefix = 'icon-original-domain:';
    }
    if (!prefix) continue;

    const host = key.slice(prefix.length);
    const siteHost = getSiteHostFromHost(host);
    if (siteHost === host) continue;

    const siteKey = `local:${prefix}${siteHost}` as const;
    if (!(siteKey in local)) {
      updates.push({ key: siteKey, value });
    }
    removals.push(`local:${key}`);
  }

  if (updates.length > 0) {
    await storage.setItems(updates);
  }
  if (removals.length > 0) {
    await storage.removeItems(removals);
  }

  await storage.setItem(DOMAIN_SCOPE_MIGRATION_KEY, true);
}

async function runMigration(): Promise<void> {
  const [alreadyMigrated, domainMigrated] = await Promise.all([
    storage.getItem<boolean>(LEGACY_MIGRATION_KEY),
    storage.getItem<boolean>(DOMAIN_SCOPE_MIGRATION_KEY),
  ]);

  if (!alreadyMigrated) {
    const legacy = await storage.getItem<LegacyIconMap>(LEGACY_ICON_KEY);
    if (legacy) {
      const entries: Array<{ key: IconStorageKey; value: string }> = [];

      for (const [host, pages] of Object.entries(legacy)) {
        for (const [pathname, info] of Object.entries(pages ?? {})) {
          if (info?.customIcon) {
            entries.push({ key: createIconStorageKey(host, pathname), value: info.customIcon });
          }
        }
      }

      if (entries.length > 0) {
        await storage.setItems(entries);
      }
      await storage.removeItem(LEGACY_ICON_KEY);
    }

    await storage.setItem(LEGACY_MIGRATION_KEY, true);
  }

  if (!domainMigrated || !alreadyMigrated) {
    await migrateDomainScopeIcons();
  }
}

/**
 * One-time migration from the old "one big object" storage format to
 * one storage entry per page.
 */
export function migrateLegacyIcons(): Promise<void> {
  migrationPromise ??= runMigration().catch((error) => {
    migrationPromise = null;
    log('error', 'Failed to migrate legacy icons', error);
  });

  return migrationPromise;
}

export async function getPageIcon(url: string): Promise<string | null> {
  const icon = await storage.getItem<string>(getIconStorageKey(url));
  return icon ? icon : null;
}

export async function setPageIcon(url: string, icon: string): Promise<void> {
  await storage.setItem(getIconStorageKey(url), icon);
}

export async function removePageIcon(url: string): Promise<void> {
  await storage.removeItem(getIconStorageKey(url));
}

/**
 * The favicon the page had before the extension touched it. Needed for pages
 * without any `<link rel="icon">`, where we created the link ourselves and
 * Chrome would otherwise keep showing our icon after the link is removed.
 */
export async function getOriginalIcon(url: string): Promise<string | null> {
  const icon = await storage.getItem<string>(getOriginalIconStorageKey(url));
  return icon ? icon : null;
}

export async function setOriginalIcon(url: string, icon: string): Promise<void> {
  await storage.setItem(getOriginalIconStorageKey(url), icon);
}

/**
 * Remove every saved page icon, leaving the theme untouched.
 */
export async function clearAllIcons(): Promise<void> {
  const local = await storage.snapshot('local');
  const keys: Array<`local:${string}`> = Object.keys(local)
    .filter(
      (key) =>
        (key.startsWith('icon:') ||
          key.startsWith('icon-domain:') ||
          key.startsWith('icon-original:') ||
          key.startsWith('icon-original-domain:')) &&
        !key.endsWith('$'),
    )
    .map((key): `local:${string}` => `local:${key}`);

  if (keys.length > 0) {
    await storage.removeItems(keys);
  }
}

/**
 * Watch the icon of a single page. Returns an unsubscribe function.
 */
export function watchPageIcon(url: string, callback: (icon: string | null) => void): () => void {
  return storage.watch<string | null>(getIconStorageKey(url), (newValue) => {
    callback(newValue ?? null);
  });
}

export async function getDomainIcon(url: string): Promise<string | null> {
  const icon = await storage.getItem<string>(getDomainIconStorageKey(url));
  return icon ? icon : null;
}

export async function setDomainIcon(url: string, icon: string): Promise<void> {
  await storage.setItem(getDomainIconStorageKey(url), icon);
}

export async function removeDomainIcon(url: string): Promise<void> {
  await storage.removeItem(getDomainIconStorageKey(url));
}

export async function getDomainOriginalIcon(url: string): Promise<string | null> {
  const icon = await storage.getItem<string>(getDomainOriginalIconStorageKey(url));
  return icon ? icon : null;
}

export async function setDomainOriginalIcon(url: string, icon: string): Promise<void> {
  await storage.setItem(getDomainOriginalIconStorageKey(url), icon);
}

/** Page-specific icon wins over a domain-wide icon. */
export async function getEffectiveIcon(url: string): Promise<string | null> {
  const pageIcon = await getPageIcon(url);
  if (pageIcon) return pageIcon;
  return getDomainIcon(url);
}

export async function getEffectiveOriginalIcon(url: string): Promise<string | null> {
  const pageOriginal = await getOriginalIcon(url);
  if (pageOriginal) return pageOriginal;
  return getDomainOriginalIcon(url);
}

/**
 * Remove page-specific icons (and their original-icon entries) for a host.
 * Used when the user explicitly applies an icon to the whole site.
 */
export async function removePageIconsForSite(url: string): Promise<void> {
  const siteHost = getSiteHost(url);
  const pagePrefix = 'icon:';
  const originalPrefix = 'icon-original:';

  const getKeyHost = (key: string, prefix: string): string | null => {
    if (!key.startsWith(prefix)) return null;

    const rest = key.slice(prefix.length);
    const slash = rest.indexOf('/');
    return slash === -1 ? null : rest.slice(0, slash);
  };

  const local = await storage.snapshot('local');
  const keys: Array<`local:${string}`> = Object.keys(local)
    .filter((key) => {
      if (key.endsWith('$')) return false;

      const host = getKeyHost(key, pagePrefix) ?? getKeyHost(key, originalPrefix);
      return host !== null && getSiteHostFromHost(host) === siteHost;
    })
    .map((key): `local:${string}` => `local:${key}`);

  if (keys.length > 0) {
    await storage.removeItems(keys);
  }
}

export function watchDomainIcon(
  url: string,
  callback: (icon: string | null) => void,
): () => void {
  return storage.watch<string | null>(getDomainIconStorageKey(url), (newValue) => {
    callback(newValue ?? null);
  });
}
