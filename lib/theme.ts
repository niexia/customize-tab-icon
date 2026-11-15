export type Theme = 'dark' | 'light' | 'system';
export type ResolvedTheme = 'dark' | 'light';

export const THEME_MIRROR_KEY = 'changicon-theme';

const THEMES: Theme[] = ['dark', 'light', 'system'];

export function getSystemTheme(): ResolvedTheme {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function resolveTheme(theme: Theme): ResolvedTheme {
  return theme === 'system' ? getSystemTheme() : theme;
}

export function applyThemeClass(
  theme: Theme,
  root: HTMLElement = document.documentElement,
): ResolvedTheme {
  const resolved = resolveTheme(theme);
  root.classList.remove('light', 'dark');
  root.classList.add(resolved);
  return resolved;
}

/**
 * `chrome.storage` is async, so the last applied theme is mirrored into
 * `localStorage` for a flash-free first paint of the popup.
 */
export function readMirroredTheme(): Theme | null {
  try {
    const value = localStorage.getItem(THEME_MIRROR_KEY);
    return THEMES.includes(value as Theme) ? (value as Theme) : null;
  } catch {
    return null;
  }
}

export function mirrorTheme(theme: Theme): void {
  try {
    localStorage.setItem(THEME_MIRROR_KEY, theme);
  } catch {
    // storage can be unavailable (e.g. disabled cookies); not critical.
  }
}
