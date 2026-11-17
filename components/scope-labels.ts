import { getScopeOptions, getSiteHost, type IconScope } from '@/lib/icon-key';

/**
 * User-facing name for the host scope, tailored to the current URL:
 * a subdomain, an apex domain, or a server address (localhost / IP).
 */
function hostNoun(url?: string): 'subdomain' | 'domain' | 'server' | 'host' {
  if (!url) return 'host';
  if (!getScopeOptions(url).includes('domain')) return 'server';

  return new URL(url).hostname === getSiteHost(url) ? 'domain' : 'subdomain';
}

export function getScopeLabel(url: string | undefined, scope: IconScope): string {
  switch (scope) {
    case 'page':
      return 'This page';
    case 'domain':
      return 'Whole site';
    case 'host':
      return `This ${hostNoun(url)}`;
  }
}

export function getResetLabel(url: string | undefined, scope: IconScope): string {
  switch (scope) {
    case 'page':
      return 'Reset page';
    case 'domain':
      return 'Reset site';
    case 'host':
      return `Reset ${hostNoun(url)}`;
  }
}

/**
 * Concrete target shown as the second line of a menu item, so the choice is
 * unambiguous even when the label relies on words like "site".
 */
export function getScopeDescription(
  url: string | undefined,
  scope: IconScope,
): string | undefined {
  if (!url || scope === 'page') return undefined;

  const host = new URL(url).host;

  if (scope === 'host') {
    return hostNoun(url) === 'domain' ? `${host}, no subdomains` : host;
  }

  return `${getSiteHost(url)} and all subdomains`;
}

export function getScopeHint(url: string | undefined, scope: IconScope): string {
  if (scope === 'page') return 'Only this page.';

  if (!url) {
    return scope === 'host'
      ? 'Every page on this host, including every path.'
      : 'Every page on this site, including subdomains.';
  }

  const host = new URL(url).host;
  const site = getSiteHost(url);

  if (scope === 'host') {
    switch (hostNoun(url)) {
      case 'server':
        return `Every page on ${host}. Replaces page icons on this server.`;
      case 'domain':
        return `Every page on ${host}, but not its subdomains. Replaces page icons on this domain.`;
      default:
        return `Every page on ${host}. Replaces page icons on this subdomain.`;
    }
  }

  return `Every page on ${site} and its subdomains. Replaces page and subdomain icons.`;
}
