/**
 * Replaces the page favicon while keeping the original `<link>` elements
 * around, so the site's own icon can be restored without reloading the page.
 *
 * Pages without any icon link are a special case: Chrome falls back to
 * `/favicon.ico`, and simply removing the link we created does not make
 * Chrome refresh the tab icon. For those pages we keep a link pointing at the
 * original favicon.
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

function writeOriginalAttrs(link: HTMLLinkElement, original: OriginalAttrs): void {
  link.setAttribute(ORIGINAL_ATTR, JSON.stringify(original));
  link.setAttribute(MANAGED_ATTR, '');
}

function recordOriginalAttrs(link: HTMLLinkElement): void {
  if (link.hasAttribute(ORIGINAL_ATTR)) return;

  writeOriginalAttrs(link, {
    href: link.getAttribute('href'),
    type: link.getAttribute('type'),
    sizes: link.getAttribute('sizes'),
    media: link.getAttribute('media'),
  });
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

function defaultFaviconUrl(doc: Document): string | null {
  try {
    return new URL('/favicon.ico', doc.baseURI).href;
  } catch {
    return null;
  }
}

function describeIcon(icon: string): { type: string; sizes: string | null } {
  if (icon.startsWith('data:image/svg+xml')) {
    return { type: 'image/svg+xml', sizes: 'any' };
  }
  // Icons can be 32px (older saved icons) or 128px (new ones). Don't claim a
  // fixed size, otherwise Chrome may pick the wrong one.
  return { type: 'image/png', sizes: null };
}

function isUsableOriginal(originalIcon: string | null | undefined, icon: string): string | null {
  if (!originalIcon || originalIcon === icon) return null;
  return originalIcon;
}

/**
 * Show `icon` as the favicon of the page.
 *
 * Existing `<link rel="icon">` elements are reused (only their attributes are
 * changed), which keeps the page's DOM and scripts working. If the page has no
 * icon at all, a dedicated link is created and the original favicon URL is
 * remembered so `clearFavicon` can restore it.
 */
export function setFavicon(
  icon: string,
  doc: Document = document,
  originalIcon?: string | null,
): void {
  if (!icon) {
    clearFavicon(doc, originalIcon);
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

    const usableOriginal = isUsableOriginal(originalIcon, icon);

    if (usableOriginal) {
      const existing = getOriginalAttrs(link);

      if (existing) {
        existing.href = usableOriginal;
        link.setAttribute(ORIGINAL_ATTR, JSON.stringify(existing));
      } else {
        writeOriginalAttrs(link, {
          href: usableOriginal,
          type: null,
          sizes: null,
          media: null,
        });
      }
    } else if (!link.hasAttribute(ORIGINAL_ATTR)) {
      const fallback = defaultFaviconUrl(doc);

      if (fallback) {
        writeOriginalAttrs(link, { href: fallback, type: null, sizes: null, media: null });
      }
    }

    link.setAttribute('type', type);
    setOrRemoveAttribute(link, 'sizes', sizes);
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
    setOrRemoveAttribute(link, 'sizes', sizes);
    link.removeAttribute('media');
    link.setAttribute('href', icon);
  }
}

/**
 * Restore the original favicons of the page.
 *
 * @param originalIcon favicon URL captured before the custom icon was applied;
 * used when the page had no icon link of its own.
 * @returns the original favicon URL, if known.
 */
export function clearFavicon(
  doc: Document = document,
  originalIcon?: string | null,
): string | null {
  let originalHref: string | null = null;

  for (const link of Array.from(
    doc.querySelectorAll<HTMLLinkElement>(`link[${MANAGED_ATTR}]`),
  )) {
    const isOwnLink = link.id === OWN_LINK_ID;
    const restoredHref = restoreLink(link);

    if (isOwnLink) {
      // Keep the link around: removing it makes Chrome keep showing our icon
      // on pages that relied on the implicit /favicon.ico.
      const href = isUsableOriginal(originalIcon, '') ?? restoredHref ?? defaultFaviconUrl(doc);

      if (href) {
        link.setAttribute('href', href);
        originalHref ??= toAbsoluteUrl(href, doc);
      } else {
        link.remove();
      }

      continue;
    }

    if (!originalHref && restoredHref) {
      originalHref = toAbsoluteUrl(restoredHref, doc);
    }
  }

  // A link restored in a previous reset is no longer "managed", but may still
  // need to be refreshed if the caller knows a better original URL.
  const ownLink = getOwnLink(doc);

  if (ownLink && !ownLink.hasAttribute(MANAGED_ATTR)) {
    const href = isUsableOriginal(originalIcon, '') ?? defaultFaviconUrl(doc);

    if (href) {
      ownLink.setAttribute('href', href);
      ownLink.removeAttribute('type');
      ownLink.removeAttribute('sizes');
      ownLink.removeAttribute('media');
      originalHref ??= toAbsoluteUrl(href, doc);
    } else {
      ownLink.remove();
    }
  }

  return originalHref;
}
