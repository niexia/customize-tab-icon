import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clearAllIcons,
  getEffectiveIconWithScope,
  getEffectiveOriginalIcon,
  removeNarrowerIcons,
} from './icons';

/**
 * In-memory stand-in for `chrome.storage.local` behind WXT's storage helper.
 * Keys are stored without the `local:` area prefix, like `storage.snapshot()`.
 */
const store = vi.hoisted(() => ({ data: new Map<string, unknown>() }));

vi.mock('wxt/utils/storage', () => {
  const normalize = (key: string) => key.replace(/^local:/, '');

  return {
    storage: {
      getItem: async (key: string) => store.data.get(normalize(key)) ?? null,
      setItem: async (key: string, value: unknown) => {
        store.data.set(normalize(key), value);
      },
      removeItem: async (key: string) => {
        store.data.delete(normalize(key));
      },
      setItems: async (items: Array<{ key: string; value: unknown }>) => {
        for (const { key, value } of items) store.data.set(normalize(key), value);
      },
      removeItems: async (keys: string[]) => {
        for (const key of keys) store.data.delete(normalize(key));
      },
      snapshot: async () => Object.fromEntries(store.data),
      watch: () => () => {},
    },
  };
});

const URL_NEWS = 'https://news.example.com/a';

beforeEach(() => {
  store.data.clear();
});

describe('getEffectiveIconWithScope', () => {
  it('resolves page, then host, then site', async () => {
    store.data.set('icon:news.example.com/a', 'page-icon');
    store.data.set('icon-host:news.example.com', 'host-icon');
    store.data.set('icon-domain:example.com', 'site-icon');

    expect(await getEffectiveIconWithScope(URL_NEWS)).toEqual({
      icon: 'page-icon',
      scope: 'page',
    });

    store.data.delete('icon:news.example.com/a');
    expect(await getEffectiveIconWithScope(URL_NEWS)).toEqual({
      icon: 'host-icon',
      scope: 'host',
    });

    store.data.delete('icon-host:news.example.com');
    expect(await getEffectiveIconWithScope(URL_NEWS)).toEqual({
      icon: 'site-icon',
      scope: 'domain',
    });

    store.data.delete('icon-domain:example.com');
    expect(await getEffectiveIconWithScope(URL_NEWS)).toBeNull();
  });

  it('walks the same order for the original favicon', async () => {
    store.data.set('icon-original-domain:example.com', 'site-original');
    store.data.set('icon-original-host:news.example.com', 'host-original');

    expect(await getEffectiveOriginalIcon(URL_NEWS)).toBe('host-original');
  });
});

describe('removeNarrowerIcons', () => {
  it('replaces page icons on the same host only', async () => {
    for (const key of [
      'icon:news.example.com/a',
      'icon-original:news.example.com/a',
      'icon:news.example.com/b',
      'icon:example.com/a',
      'icon:other.com/a',
      'icon-host:www.example.com',
      'icon:localhost:3000/a',
      'icon:localhost:4000/a',
    ]) {
      store.data.set(key, 'icon');
    }

    await removeNarrowerIcons(URL_NEWS, 'host');

    expect(store.data.has('icon:news.example.com/a')).toBe(false);
    expect(store.data.has('icon-original:news.example.com/a')).toBe(false);
    expect(store.data.has('icon:news.example.com/b')).toBe(false);
    // Other hosts, other sites, and broader scopes are untouched.
    expect(store.data.has('icon:example.com/a')).toBe(true);
    expect(store.data.has('icon:other.com/a')).toBe(true);
    expect(store.data.has('icon-host:www.example.com')).toBe(true);
    expect(store.data.has('icon:localhost:3000/a')).toBe(true);
    expect(store.data.has('icon:localhost:4000/a')).toBe(true);
  });

  it('removes page and host icons across the site, including the apex twin', async () => {
    for (const key of [
      'icon:news.example.com/a',
      'icon-original:news.example.com/a',
      'icon:example.com/a',
      'icon-host:news.example.com',
      'icon-original-host:news.example.com',
      'icon-host:example.com',
      'icon:other.com/a',
      'icon-host:other.com',
      'icon-domain:example.com',
      'icon-domain:other.com',
    ]) {
      store.data.set(key, 'icon');
    }

    await removeNarrowerIcons(URL_NEWS, 'domain');

    for (const key of [
      'icon:news.example.com/a',
      'icon-original:news.example.com/a',
      'icon:example.com/a',
      'icon-host:news.example.com',
      'icon-original-host:news.example.com',
      'icon-host:example.com',
    ]) {
      expect(store.data.has(key), key).toBe(false);
    }

    // Another site and the site-scope icons themselves survive.
    expect(store.data.has('icon:other.com/a')).toBe(true);
    expect(store.data.has('icon-host:other.com')).toBe(true);
    expect(store.data.has('icon-domain:example.com')).toBe(true);
    expect(store.data.has('icon-domain:other.com')).toBe(true);
  });

  it('does nothing for the page scope', async () => {
    store.data.set('icon:news.example.com/a', 'icon');
    store.data.set('icon-host:news.example.com', 'icon');

    await removeNarrowerIcons(URL_NEWS, 'page');

    expect(store.data.has('icon:news.example.com/a')).toBe(true);
    expect(store.data.has('icon-host:news.example.com')).toBe(true);
  });
});

describe('clearAllIcons', () => {
  it('removes every scoped icon and keeps other settings', async () => {
    for (const key of [
      'icon:news.example.com/a',
      'icon-original:news.example.com/a',
      'icon-host:news.example.com',
      'icon-original-host:news.example.com',
      'icon-domain:example.com',
      'icon-original-domain:example.com',
      'changicon-theme',
      'changicon-scope',
      'icon:news.example.com/a$',
    ]) {
      store.data.set(key, 'value');
    }

    await clearAllIcons();

    expect(store.data.has('icon:news.example.com/a')).toBe(false);
    expect(store.data.has('icon-original:news.example.com/a')).toBe(false);
    expect(store.data.has('icon-host:news.example.com')).toBe(false);
    expect(store.data.has('icon-original-host:news.example.com')).toBe(false);
    expect(store.data.has('icon-domain:example.com')).toBe(false);
    expect(store.data.has('icon-original-domain:example.com')).toBe(false);
    expect(store.data.get('changicon-theme')).toBe('value');
    expect(store.data.get('changicon-scope')).toBe('value');
    expect(store.data.has('icon:news.example.com/a$')).toBe(true);
  });
});
