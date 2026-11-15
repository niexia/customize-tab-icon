/**
 * Replaces the page favicon while keeping the original `<link>` elements
 * around, so the site's own icon can be restored without reloading the page.
 */

const OWN_LINK_ID = 'changicon-favicon';
const MANAGED_ATTR = 'data-changicon-managed';
const ORIGINAL_ATTR = 'data-changicon-original';

interface OriginalAttrs {
  href: string | null;
  type: string | null;
  sizes: string | null;
  media: string | null;
}

function getHead(doc: Document): HTMLElement {
  return doc.head ?? doc.documentElement;
}

function getOwnLink(doc: Document): HTMLLinkElement | null {
  const link = doc.getElementById(OWN_LINK_ID);
  return link instanceof HTMLLinkElement ? link : null;
}

function getSiteIconLinks(doc: Document): HTMLLinkElement[] {
  return Array.from(doc.querySelectorAll<HTMLLinkElement>('link[rel~="icon"]')).filter(
    (link) => link.id !== OWN_LINK_ID,
  );
}

function getOriginalAttrs(link: HTMLLinkElement): OriginalAttrs | null {
  const raw = link.getAttribute(ORIGINAL_ATTR);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as OriginalAttrs;
  } catch {
    return null;
  }
}

function recordOriginalAttrs(link: HTMLLinkElement): void {
  if (link.hasAttribute(ORIGINAL_ATTR)) return;

  const original: OriginalAttrs = {
    href: link.getAttribute('href'),
    type: link.getAttribute('type'),
    sizes: link.getAttribute('sizes'),
    media: link.getAttribute('media'),
  };

  link.setAttribute(ORIGINAL_ATTR, JSON.stringify(original));
  link.setAttribute(MANAGED_ATTR, '');
}

function updateOriginalHref(link: HTMLLinkElement, href: string | null): void {
  const original = getOriginalAttrs(link);
  if (!original) return;

  original.href = href;
  link.setAttribute(ORIGINAL_ATTR, JSON.stringify(original));
}

function setOrRemoveAttribute(link: HTMLLinkElement, name: string, value: string | null): void {
  if (value === null) {
    link.removeAttribute(name);
  } else {
    link.setAttribute(name, value);
  }
}

function restoreLink(link: HTMLLinkElement): string | null {
  const original = getOriginalAttrs(link);

  if (original) {
    setOrRemoveAttribute(link, 'href', original.href);
    setOrRemoveAttribute(link, 'type', original.type);
    setOrRemoveAttribute(link, 'sizes', original.sizes);
    setOrRemoveAttribute(link, 'media', original.media);
  }

  link.removeAttribute(ORIGINAL_ATTR);
  link.removeAttribute(MANAGED_ATTR);

  return original?.href ?? null;
}

function toAbsoluteUrl(href: string, doc: Document): string {
  try {
    return new URL(href, doc.baseURI).href;
  } catch {
    return href;
  }
}

function describeIcon(icon: string): { type: string; sizes: string } {
  if (icon.startsWith('data:image/svg+xml')) {
    return { type: 'image/svg+xml', sizes: 'any' };
  }
  return { type: 'image/png', sizes: '32x32' };
}

/**
 * Show `icon` as the favicon of the page.
 *
 * Existing `<link rel="icon">` elements are reused (only their attributes are
 * changed), which keeps the page's DOM and scripts working. If the page has no
 * icon at all, a dedicated link is created.
 */
export function setFavicon(icon: string, doc: Document = document): void {
  if (!icon) {
    clearFavicon(doc);
    return;
  }

  const { type, sizes } = describeIcon(icon);
  const links = getSiteIconLinks(doc);

  if (links.length === 0) {
    let link = getOwnLink(doc);

    if (!link) {
      link = doc.createElement('link');
      link.id = OWN_LINK_ID;
      link.rel = 'icon';
      getHead(doc).appendChild(link);
    }

    link.setAttribute('type', type);
    link.setAttribute('sizes', sizes);
    link.setAttribute('href', icon);
    return;
  }

  // The page now has its own icon links again; drop our fallback link.
  getOwnLink(doc)?.remove();

  for (const link of links) {
    if (!link.hasAttribute(ORIGINAL_ATTR)) {
      recordOriginalAttrs(link);
    } else if (link.getAttribute('href') !== icon) {
      // The site changed its icon while ours was shown. Remember the new
      // original so "Reset" restores the latest site icon.
      updateOriginalHref(link, link.getAttribute('href'));
    }

    link.setAttribute('type', type);
    link.setAttribute('sizes', sizes);
    link.removeAttribute('media');
    link.setAttribute('href', icon);
  }
}

/**
 * Restore the original favicons of the page.
 *
 * @returns the first original favicon URL, so the popup can show it again
 * without waiting for the browser to refresh `tab.favIconUrl`.
 */
export function clearFavicon(doc: Document = document): string | null {
  let originalHref: string | null = null;

  for (const link of Array.from(doc.querySelectorAll<HTMLLinkElement>(
    `link[${MANAGED_ATTR}]`,
  ))) {
    const restoredHref = restoreLink(link);

    if (!originalHref && restoredHref) {
      originalHref = toAbsoluteUrl(restoredHref, doc);
    }
  }

  getOwnLink(doc)?.remove();
  return originalHref;
}
