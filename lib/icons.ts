import { storage } from 'wxt/utils/storage';
import {
  createIconStorageKey,
  DOMAIN_SCOPE_MIGRATION_KEY,
  getScopeIconStorageKey,
  getScopeOriginalIconStorageKey,
  getSiteHost,
  getSiteHostFromHost,
  ICON_SCOPES,
  type IconScope,
  type IconStorageKey,
  LEGACY_ICON_KEY,
  LEGACY_MIGRATION_KEY,
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

/* ---------------------------------- CRUD ---------------------------------- */

export async function getIcon(url: string, scope: IconScope): Promise<string | null> {
  const icon = await storage.getItem<string>(getScopeIconStorageKey(url, scope));
  return icon ? icon : null;
}

export async function setIcon(url: string, scope: IconScope, icon: string): Promise<void> {
  await storage.setItem(getScopeIconStorageKey(url, scope), icon);
}

export async function removeIcon(url: string, scope: IconScope): Promise<void> {
  await storage.removeItem(getScopeIconStorageKey(url, scope));
}

/**
 * The favicon the page had before the extension touched it. Needed for pages
 * without any `<link rel="icon">`, where we created the link ourselves and
 * Chrome would otherwise keep showing our icon after the link is removed.
 */
export async function getOriginalIcon(url: string, scope: IconScope): Promise<string | null> {
  const icon = await storage.getItem<string>(getScopeOriginalIconStorageKey(url, scope));
  return icon ? icon : null;
}

export async function setOriginalIcon(url: string, scope: IconScope, icon: string): Promise<void> {
  await storage.setItem(getScopeOriginalIconStorageKey(url, scope), icon);
}

/** Page icon wins over the host icon, which wins over the site icon. */
export interface EffectiveIcon {
  icon: string;
  scope: IconScope;
}

export async function getEffectiveIconWithScope(url: string): Promise<EffectiveIcon | null> {
  for (const scope of ICON_SCOPES) {
    const icon = await getIcon(url, scope);
    if (icon) return { icon, scope };
  }

  return null;
}

export async function getEffectiveIcon(url: string): Promise<string | null> {
  const effective = await getEffectiveIconWithScope(url);
  return effective?.icon ?? null;
}

export async function getEffectiveOriginalIcon(url: string): Promise<string | null> {
  for (const scope of ICON_SCOPES) {
    const icon = await getOriginalIcon(url, scope);
    if (icon) return icon;
  }

  return null;
}

/* --------------------------------- Cleanup -------------------------------- */

const PAGE_ICON_PREFIX = 'icon:';
const PAGE_ORIGINAL_PREFIX = 'icon-original:';
const HOST_ICON_PREFIX = 'icon-host:';
const HOST_ORIGINAL_PREFIX = 'icon-original-host:';

/** Host part of a page key such as `icon:news.example.com/docs`. */
function pageKeyHost(key: string, prefix: string): string | null {
  if (!key.startsWith(prefix)) return null;

  const rest = key.slice(prefix.length);
  const slash = rest.indexOf('/');
  return slash === -1 ? null : rest.slice(0, slash);
}

function hostKeyHost(key: string): string | null {
  if (key.startsWith(HOST_ICON_PREFIX)) return key.slice(HOST_ICON_PREFIX.length);
  if (key.startsWith(HOST_ORIGINAL_PREFIX)) return key.slice(HOST_ORIGINAL_PREFIX.length);
  return null;
}

/**
 * Remove icons at scopes narrower than `scope`, but only inside its range.
 * Applying a wider icon has to clear the narrower choices that would otherwise
 * keep shadowing it — e.g. a whole-site icon must replace page and host icons
 * on every host of the domain, including the apex host entry.
 */
export async function removeNarrowerIcons(url: string, scope: IconScope): Promise<void> {
  if (scope === 'page') return;

  const local = await storage.snapshot('local');
  const siteHost = getSiteHost(url);
  const host = new URL(url).host;

  const covers = (keyHost: string) =>
    scope === 'host' ? keyHost === host : getSiteHostFromHost(keyHost) === siteHost;

  const keys: Array<`local:${string}`> = [];

  for (const key of Object.keys(local)) {
    if (key.endsWith('$')) continue;

    const hostOfPage = pageKeyHost(key, PAGE_ICON_PREFIX) ?? pageKeyHost(key, PAGE_ORIGINAL_PREFIX);
    if (hostOfPage !== null) {
      if (covers(hostOfPage)) keys.push(`local:${key}`);
      continue;
    }

    if (scope === 'domain') {
      const hostOfIcon = hostKeyHost(key);
      if (hostOfIcon !== null && covers(hostOfIcon)) keys.push(`local:${key}`);
    }
  }

  if (keys.length > 0) {
    await storage.removeItems(keys);
  }
}

/**
 * Remove every saved icon, leaving the theme and other settings untouched.
 */
export async function clearAllIcons(): Promise<void> {
  const prefixes = [
    PAGE_ICON_PREFIX,
    PAGE_ORIGINAL_PREFIX,
    HOST_ICON_PREFIX,
    HOST_ORIGINAL_PREFIX,
    'icon-domain:',
    'icon-original-domain:',
  ];

  const local = await storage.snapshot('local');
  const keys: Array<`local:${string}`> = Object.keys(local)
    .filter((key) => !key.endsWith('$') && prefixes.some((prefix) => key.startsWith(prefix)))
    .map((key): `local:${string}` => `local:${key}`);

  if (keys.length > 0) {
    await storage.removeItems(keys);
  }
}

/* -------------------------------- Watchers -------------------------------- */

/** Run `callback` whenever any scoped icon for this URL changes. */
export function watchIconChanges(url: string, callback: () => void): () => void {
  const unsubscribes = ICON_SCOPES.map((scope) =>
    storage.watch<string | null>(getScopeIconStorageKey(url, scope), () => callback()),
  );

  return () => {
    for (const unsubscribe of unsubscribes) unsubscribe();
  };
}
