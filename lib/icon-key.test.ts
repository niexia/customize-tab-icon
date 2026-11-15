import { describe, expect, it } from 'vitest';
import {
  getDomainIconStorageKey,
  getDomainOriginalIconStorageKey,
  getIconStorageKey,
  getSiteHost,
  getSiteHostFromHost,
  isSupportedUrl,
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
