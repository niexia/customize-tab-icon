// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';
import { clearFavicon, setFavicon } from './favicon-dom';

const PNG_ICON = 'data:image/png;base64,AAAA';
const SVG_ICON =
  'data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3C%2Fsvg%3E';

function createLink(attributes: Record<string, string>): HTMLLinkElement {
  const link = document.createElement('link');

  for (const [name, value] of Object.entries(attributes)) {
    link.setAttribute(name, value);
  }

  document.head.appendChild(link);
  return link;
}

describe('favicon-dom', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
    document.body.innerHTML = '';
  });

  it('reuses the page icon and restores it on clear', () => {
    const link = createLink({
      rel: 'icon',
      href: '/favicon.ico',
      type: 'image/x-icon',
      sizes: '16x16',
    });

    setFavicon(PNG_ICON);

    expect(link.getAttribute('href')).toBe(PNG_ICON);
    expect(link.getAttribute('type')).toBe('image/png');
    expect(link.hasAttribute('sizes')).toBe(false);

    clearFavicon();

    expect(link.getAttribute('href')).toBe('/favicon.ico');
    expect(link.getAttribute('type')).toBe('image/x-icon');
    expect(link.getAttribute('sizes')).toBe('16x16');
    expect(link.hasAttribute('data-changicon-managed')).toBe(false);
    expect(link.hasAttribute('data-changicon-original')).toBe(false);
  });

  it('keeps a fallback link pointing at the default favicon when cleared', () => {
    setFavicon(PNG_ICON);

    const fallback = document.getElementById('changicon-favicon');
    expect(fallback).not.toBeNull();
    expect(fallback?.getAttribute('href')).toBe(PNG_ICON);

    const restored = clearFavicon();

    // Removing the link would make Chrome keep showing the custom icon on
    // pages that rely on the implicit /favicon.ico, so it is kept around.
    expect(document.getElementById('changicon-favicon')).not.toBeNull();
    expect(fallback?.getAttribute('href')).toBe('http://localhost:3000/favicon.ico');
    expect(fallback?.hasAttribute('data-changicon-managed')).toBe(false);
    expect(restored).toBe('http://localhost:3000/favicon.ico');
  });

  it('restores the captured original favicon for pages without icon links', () => {
    setFavicon(PNG_ICON, document, 'https://example.com/site.ico');

    const fallback = document.getElementById('changicon-favicon');
    const restored = clearFavicon(document, 'https://example.com/site.ico');

    expect(fallback?.getAttribute('href')).toBe('https://example.com/site.ico');
    expect(restored).toBe('https://example.com/site.ico');
  });

  it('does not touch apple-touch icons', () => {
    const appleIcon = createLink({ rel: 'apple-touch-icon', href: '/apple.png' });

    setFavicon(PNG_ICON);
    expect(appleIcon.getAttribute('href')).toBe('/apple.png');

    clearFavicon();
    expect(appleIcon.getAttribute('href')).toBe('/apple.png');
  });

  it('uses an svg link type for svg data urls', () => {
    const link = createLink({ rel: 'shortcut icon', href: '/favicon.ico' });

    setFavicon(SVG_ICON);

    expect(link.getAttribute('type')).toBe('image/svg+xml');
    expect(link.getAttribute('sizes')).toBe('any');
  });

  it('restores the latest site icon when the site changed it', () => {
    const link = createLink({ rel: 'icon', href: '/old.ico' });

    setFavicon(PNG_ICON);
    link.setAttribute('href', '/new.ico');

    // The content script's MutationObserver calls setFavicon again.
    setFavicon(PNG_ICON);
    expect(link.getAttribute('href')).toBe(PNG_ICON);

    clearFavicon();
    expect(link.getAttribute('href')).toBe('/new.ico');
  });

  it('temporarily removes media queries and restores them', () => {
    const link = createLink({
      rel: 'icon',
      href: '/dark.ico',
      media: '(prefers-color-scheme: dark)',
    });

    setFavicon(PNG_ICON);
    expect(link.hasAttribute('media')).toBe(false);

    clearFavicon();
    expect(link.getAttribute('media')).toBe('(prefers-color-scheme: dark)');
    expect(link.getAttribute('href')).toBe('/dark.ico');
  });

  it('removes its fallback link when the page adds icons later', () => {
    setFavicon(PNG_ICON);
    expect(document.getElementById('changicon-favicon')).not.toBeNull();

    const siteLink = createLink({ rel: 'icon', href: '/site.ico' });
    setFavicon(PNG_ICON);

    expect(document.getElementById('changicon-favicon')).toBeNull();
    expect(siteLink.getAttribute('href')).toBe(PNG_ICON);
  });
});
