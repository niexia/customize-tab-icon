import { describe, expect, it } from 'vitest';
import {
  getDomainIconStorageKey,
  getDomainOriginalIconStorageKey,
  getHostIconStorageKey,
  getIconStorageKey,
  getScopeIconStorageKey,
  getScopeOptions,
  getScopeTarget,
  getSiteHost,
  getSiteHostFromHost,
  isSupportedUrl,
  resolveScope,
} from './icon-key';

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

  it('uses the registrable domain for whole-site icons', () => {
    expect(getDomainIconStorageKey('https://news.zhibo8.com/a/b')).toBe(
      'local:icon-domain:zhibo8.com',
    );
    expect(getDomainIconStorageKey('https://zhibo8.com/other')).toBe(
      getDomainIconStorageKey('https://news.zhibo8.com/a'),
    );
    expect(getDomainIconStorageKey('https://www.bbc.co.uk/news')).toBe(
      'local:icon-domain:bbc.co.uk',
    );
  });

  it('keeps the port for localhost / IP addresses', () => {
    expect(getDomainIconStorageKey('http://127.0.0.1:5000/a')).toBe(
      'local:icon-domain:127.0.0.1:5000',
    );
    expect(getSiteHost('http://localhost:3000/a')).toBe('localhost:3000');
  });

  it('normalizes stored host keys to registrable domains', () => {
    expect(getSiteHostFromHost('news.zhibo8.com')).toBe('zhibo8.com');
    expect(getSiteHostFromHost('zhibo8.com')).toBe('zhibo8.com');
    expect(getSiteHostFromHost('news.zhibo8.com:8080')).toBe('zhibo8.com');
  });

  it('keeps page, domain and original keys distinct', () => {
    expect(getDomainIconStorageKey('https://example.com/a')).not.toBe(
      getIconStorageKey('https://example.com/a'),
    );
    expect(getDomainOriginalIconStorageKey('https://news.example.com/a')).toBe(
      'local:icon-original-domain:example.com',
    );
  });
});

describe('host-scope keys', () => {
  it('keys by host, including the port', () => {
    expect(getHostIconStorageKey('https://news.example.com/a/b')).toBe(
      'local:icon-host:news.example.com',
    );
    expect(getHostIconStorageKey('http://localhost:3000/a')).toBe('local:icon-host:localhost:3000');
  });

  it('keeps host and site keys apart on an apex domain', () => {
    expect(getHostIconStorageKey('https://example.com/a')).toBe('local:icon-host:example.com');
    expect(getDomainIconStorageKey('https://example.com/a')).toBe('local:icon-domain:example.com');
  });

  it('dispatches by scope', () => {
    const url = 'https://news.example.com/docs';
    expect(getScopeIconStorageKey(url, 'page')).toBe(getIconStorageKey(url));
    expect(getScopeIconStorageKey(url, 'host')).toBe(getHostIconStorageKey(url));
    expect(getScopeIconStorageKey(url, 'domain')).toBe(getDomainIconStorageKey(url));
  });
});

describe('getScopeTarget', () => {
  it('resolves each scope to the identifier it covers', () => {
    const url = 'https://news.example.com:8443/docs?q=1#top';
    expect(getScopeTarget(url, 'page')).toBe('news.example.com:8443/docs');
    expect(getScopeTarget(url, 'host')).toBe('news.example.com:8443');
    expect(getScopeTarget(url, 'domain')).toBe('example.com');
  });
});

describe('getScopeOptions', () => {
  it('offers all three scopes for regular domains', () => {
    expect(getScopeOptions('https://news.example.com/docs')).toEqual(['page', 'host', 'domain']);
  });

  it('keeps host and site on an apex domain, because only site covers subdomains', () => {
    expect(getScopeOptions('https://example.com/docs')).toEqual(['page', 'host', 'domain']);
  });

  it('collapses host and site for localhost and IP addresses', () => {
    expect(getScopeOptions('http://localhost:3000/a')).toEqual(['page', 'host']);
    expect(getScopeOptions('http://127.0.0.1:5000/a')).toEqual(['page', 'host']);
    expect(getScopeOptions('http://[::1]:5000/a')).toEqual(['page', 'host']);
  });
});

describe('resolveScope', () => {
  it('keeps a valid preference', () => {
    expect(resolveScope('https://news.example.com/a', 'domain')).toBe('domain');
    expect(resolveScope('https://news.example.com/a', 'host')).toBe('host');
  });

  it('falls back to the host scope where site scope would be identical', () => {
    expect(resolveScope('http://localhost:3000/a', 'domain')).toBe('host');
    expect(resolveScope('http://127.0.0.1:5000/a', 'domain')).toBe('host');
  });
});
