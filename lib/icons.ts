import { storage } from 'wxt/utils/storage';
import {
  createIconStorageKey,
  getIconStorageKey,
  getOriginalIconStorageKey,
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

async function runMigration(): Promise<void> {
  const alreadyMigrated = await storage.getItem<boolean>(LEGACY_MIGRATION_KEY);
  if (alreadyMigrated) return;

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
        (key.startsWith('icon:') || key.startsWith('icon-original:')) && !key.endsWith('$'),
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
