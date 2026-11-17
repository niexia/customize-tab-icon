/**
 * Pure helpers shared by the popup and content scripts.
 *
 * Kept free of browser/storage imports so they can be unit tested.
 */

/**
 * Page icons apply to one host + pathname, host icons to every path on one
 * host (including its port) and site icons to the registrable domain.
 */
export type IconScope = 'page' | 'host' | 'domain';

/** Narrowest → widest. Icon resolution walks this order. */
export const ICON_SCOPES = ['page', 'host', 'domain'] as const;

export type IconStorageKey = `local:icon:${string}`;
export type OriginalIconStorageKey = `local:icon-original:${string}`;
export type HostIconStorageKey = `local:icon-host:${string}`;
export type HostOriginalIconStorageKey = `local:icon-original-host:${string}`;
export type DomainIconStorageKey = `local:icon-domain:${string}`;
export type DomainOriginalIconStorageKey = `local:icon-original-domain:${string}`;

export const ICON_KEY_PREFIX = 'local:icon:';
export const ORIGINAL_ICON_KEY_PREFIX = 'local:icon-original:';
export const HOST_ICON_KEY_PREFIX = 'local:icon-host:';
export const HOST_ORIGINAL_ICON_KEY_PREFIX = 'local:icon-original-host:';
export const DOMAIN_ICON_KEY_PREFIX = 'local:icon-domain:';
export const DOMAIN_ORIGINAL_ICON_KEY_PREFIX = 'local:icon-original-domain:';

/** Old storage format: `{ [host]: { [pathname]: { customIcon } } }` */
export const LEGACY_ICON_KEY = 'local:changicon-local';
export const LEGACY_MIGRATION_KEY = 'local:icons-migrated-v2';
export const DOMAIN_SCOPE_MIGRATION_KEY = 'local:icons-domain-scope-migrated-v1';

/**
 * Only regular web pages can be modified. Browser pages (`chrome://`),
 * extension pages and the Web Store cannot run content scripts.
 */
export function isSupportedUrl(url?: string | null): boolean {
  if (!url) return false;

  try {
    const { protocol } = new URL(url);
    return protocol === 'http:' || protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * One storage entry per host + pathname.
 *
 * `host` includes the port, and the protocol is intentionally ignored so
 * `http://` and `https://` share the same icon.
 */
export function createIconStorageKey(host: string, pathname: string): IconStorageKey {
  return `${ICON_KEY_PREFIX}${host}${pathname}`;
}

export function getIconStorageKey(url: string | URL): IconStorageKey {
  const parsed = typeof url === 'string' ? new URL(url) : url;
  return createIconStorageKey(parsed.host, parsed.pathname);
}

export function getOriginalIconStorageKey(url: string | URL): OriginalIconStorageKey {
  const parsed = typeof url === 'string' ? new URL(url) : url;
  return `${ORIGINAL_ICON_KEY_PREFIX}${parsed.host}${parsed.pathname}`;
}

/**
 * One storage entry per host for host-scoped icons. The port is part of the
 * host, so `localhost:3000` and `localhost:4000` stay independent.
 */
export function getHostIconStorageKey(url: string | URL): HostIconStorageKey {
  const parsed = typeof url === 'string' ? new URL(url) : url;
  return `${HOST_ICON_KEY_PREFIX}${parsed.host}`;
}

export function getHostOriginalIconStorageKey(url: string | URL): HostOriginalIconStorageKey {
  const parsed = typeof url === 'string' ? new URL(url) : url;
  return `${HOST_ORIGINAL_ICON_KEY_PREFIX}${parsed.host}`;
}

const MULTI_LEVEL_PUBLIC_SUFFIXES = new Set([
  // United Kingdom
  'co.uk', 'org.uk', 'ac.uk', 'gov.uk', 'ltd.uk', 'plc.uk', 'me.uk', 'net.uk', 'sch.uk',
  // China / Hong Kong / Taiwan / Macau
  'com.cn', 'net.cn', 'org.cn', 'gov.cn', 'edu.cn', 'ac.cn',
  'com.hk', 'net.hk', 'org.hk', 'edu.hk', 'gov.hk',
  'com.tw', 'net.tw', 'org.tw', 'edu.tw', 'gov.tw',
  'com.mo', 'net.mo', 'org.mo',
  // Asia-Pacific
  'com.au', 'net.au', 'org.au', 'edu.au', 'gov.au', 'id.au',
  'co.nz', 'net.nz', 'org.nz', 'govt.nz', 'ac.nz',
  'co.jp', 'ne.jp', 'or.jp', 'ac.jp', 'go.jp', 'ad.jp', 'ed.jp', 'gr.jp', 'lg.jp',
  'co.kr', 'ne.kr', 'or.kr', 're.kr', 'pe.kr', 'go.kr', 'mil.kr', 'ac.kr',
  'com.sg', 'net.sg', 'org.sg', 'edu.sg', 'gov.sg',
  'com.my', 'net.my', 'org.my', 'edu.my', 'gov.my',
  'com.ph', 'net.ph', 'org.ph', 'edu.ph', 'gov.ph',
  'com.vn', 'net.vn', 'org.vn', 'edu.vn', 'gov.vn',
  'com.id', 'net.id', 'org.id', 'ac.id', 'co.id', 'web.id', 'sch.id', 'go.id', 'mil.id',
  'co.th', 'in.th', 'ac.th', 'go.th', 'net.th', 'or.th',
  // Americas
  'com.br', 'net.br', 'org.br', 'edu.br', 'gov.br',
  'com.mx', 'net.mx', 'org.mx', 'edu.mx', 'gob.mx',
  'com.ar', 'net.ar', 'org.ar', 'edu.ar', 'gob.ar',
  'com.co', 'net.co', 'org.co', 'edu.co', 'gov.co',
  'com.pe', 'net.pe', 'org.pe', 'edu.pe', 'gob.pe',
  // Europe / Middle East / Africa
  'com.tr', 'net.tr', 'org.tr', 'edu.tr', 'gov.tr',
  'com.ua', 'net.ua', 'org.ua', 'edu.ua', 'gov.ua',
  'com.pl', 'net.pl', 'org.pl', 'edu.pl', 'gov.pl',
  'com.es', 'net.es', 'org.es', 'edu.es', 'gob.es',
  'com.it', 'net.it', 'org.it', 'edu.it', 'gov.it',
  'co.il', 'org.il', 'net.il', 'ac.il', 'gov.il', 'muni.il',
  'com.sa', 'net.sa', 'org.sa', 'edu.sa', 'gov.sa',
  'com.eg', 'net.eg', 'org.eg', 'edu.eg', 'gov.eg',
  'co.za', 'net.za', 'org.za', 'gov.za', 'ac.za',
  'co.in', 'net.in', 'org.in', 'firm.in', 'gen.in', 'ind.in', 'ac.in', 'edu.in', 'gov.in', 'mil.in',
]);

function isIpOrLocalHost(hostname: string): boolean {
  return (
    hostname === 'localhost' ||
    hostname.endsWith('.localhost') ||
    hostname.startsWith('[') ||
    /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)
  );
}

/**
 * "Whole site" means the registrable domain, so `news.example.com` and
 * `www.example.com` share one site icon. IP addresses and localhost fall back
 * to the full host (including port).
 *
 * This uses a small list of common multi-level public suffixes instead of the
 * full Public Suffix List to keep the extension bundle small.
 */
export function getSiteHost(url: string | URL): string {
  const parsed = typeof url === 'string' ? new URL(url) : url;
  const hostname = parsed.hostname.replace(/\.$/, '');

  if (!hostname || !hostname.includes('.') || isIpOrLocalHost(hostname)) {
    return parsed.host;
  }

  const parts = hostname.split('.');
  const lastTwo = parts.slice(-2).join('.');
  const registrable = MULTI_LEVEL_PUBLIC_SUFFIXES.has(lastTwo)
    ? parts.slice(-3).join('.')
    : lastTwo;

  return registrable;
}

export function getSiteHostFromHost(host: string): string {
  try {
    return getSiteHost(new URL(`http://${host}/`));
  } catch {
    return host;
  }
}

export function getDomainIconStorageKey(url: string | URL): DomainIconStorageKey {
  return `${DOMAIN_ICON_KEY_PREFIX}${getSiteHost(url)}`;
}

export function getDomainOriginalIconStorageKey(
  url: string | URL,
): DomainOriginalIconStorageKey {
  return `${DOMAIN_ORIGINAL_ICON_KEY_PREFIX}${getSiteHost(url)}`;
}

/**
 * The identifier a scope resolves to. Used both as the storage-key suffix and
 * to decide whether two tabs are covered by the same icon:
 * `page` = host + pathname, `host` = host including port, `domain` = siteHost.
 */
export function getScopeTarget(url: string | URL, scope: IconScope): string {
  const parsed = typeof url === 'string' ? new URL(url) : url;

  switch (scope) {
    case 'page':
      return `${parsed.host}${parsed.pathname}`;
    case 'host':
      return parsed.host;
    case 'domain':
      return getSiteHost(parsed);
  }
}

export function getScopeIconStorageKey(
  url: string | URL,
  scope: IconScope,
): IconStorageKey | HostIconStorageKey | DomainIconStorageKey {
  switch (scope) {
    case 'page':
      return getIconStorageKey(url);
    case 'host':
      return getHostIconStorageKey(url);
    case 'domain':
      return getDomainIconStorageKey(url);
  }
}

export function getScopeOriginalIconStorageKey(
  url: string | URL,
  scope: IconScope,
): OriginalIconStorageKey | HostOriginalIconStorageKey | DomainOriginalIconStorageKey {
  switch (scope) {
    case 'page':
      return getOriginalIconStorageKey(url);
    case 'host':
      return getHostOriginalIconStorageKey(url);
    case 'domain':
      return getDomainOriginalIconStorageKey(url);
  }
}

/**
 * Whether the site scope adds anything beyond the current host. IP addresses
 * and localhost have no subdomains, so "this host" and "whole site" would be
 * the same choice there.
 */
function hasSubdomainCoverage(url: string | URL): boolean {
  const parsed = typeof url === 'string' ? new URL(url) : url;
  const hostname = parsed.hostname.replace(/\.$/, '');
  return Boolean(hostname) && hostname.includes('.') && !isIpOrLocalHost(hostname);
}

/**
 * Scopes the popup offers for a URL, narrowest first. An apex domain still
 * gets both host and site options: they share the same hostname but the site
 * scope also covers subdomains.
 */
export function getScopeOptions(url: string | URL): IconScope[] {
  return hasSubdomainCoverage(url) ? ['page', 'host', 'domain'] : ['page', 'host'];
}

/**
 * Keep a stored scope preference valid for the current URL. A saved "whole
 * site" preference on localhost falls back to the equivalent host scope.
 */
export function resolveScope(url: string | URL, scope: IconScope): IconScope {
  const options = getScopeOptions(url);
  return options.includes(scope) ? scope : (options.at(-1) ?? 'host');
}
