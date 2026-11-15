import { describe, expect, it } from 'vitest';
import { getIconStorageKey, isSupportedUrl } from './icon-key';

describe('isSupportedUrl', () => {
  it('accepts http and https pages', () => {
    expect(isSupportedUrl('https://example.com')).toBe(true);
    expect(isSupportedUrl('http://localhost:3000/page')).toBe(true);
  });

  it('rejects browser and extension pages', () => {
    expect(isSupportedUrl('chrome://extensions')).toBe(false);
    expect(isSupportedUrl('chrome-extension://abc/popup.html')).toBe(false);
    expect(isSupportedUrl('file:///tmp/index.html')).toBe(false);
    expect(isSupportedUrl('about:blank')).toBe(false);
  });

  it('rejects missing or invalid urls', () => {
    expect(isSupportedUrl(undefined)).toBe(false);
    expect(isSupportedUrl(null)).toBe(false);
    expect(isSupportedUrl('')).toBe(false);
    expect(isSupportedUrl('not a url')).toBe(false);
  });
});

describe('getIconStorageKey', () => {
  it('includes host, port and pathname', () => {
    expect(getIconStorageKey('https://example.com:8443/a/b?q=1#hash')).toBe(
      'local:icon:example.com:8443/a/b',
    );
  });

  it('keeps the root pathname', () => {
    expect(getIconStorageKey('https://example.com')).toBe('local:icon:example.com/');
  });

  it('accepts a URL instance', () => {
    expect(getIconStorageKey(new URL('https://example.com/docs'))).toBe(
      'local:icon:example.com/docs',
    );
  });

  it('ignores the protocol so http and https share an icon', () => {
    expect(getIconStorageKey('http://example.com/page')).toBe(
      getIconStorageKey('https://example.com/page'),
    );
  });
});
