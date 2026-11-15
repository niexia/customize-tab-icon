import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { changiconTheme } from '@/lib/store';
import {
  applyThemeClass,
  getSystemTheme,
  mirrorTheme,
  readMirroredTheme,
  type ResolvedTheme,
  type Theme,
} from '@/lib/theme';
import { log } from '@/lib/utils';
import { ThemeProviderContext } from './theme-context';

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
};

export function ThemeProvider({ children, defaultTheme = 'system' }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => readMirroredTheme() ?? defaultTheme);
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(() => getSystemTheme());
  const userChangedTheme = useRef(false);
  const resolvedTheme = theme === 'system' ? systemTheme : theme;

  useLayoutEffect(() => {
    applyThemeClass(resolvedTheme);
    mirrorTheme(theme);
  }, [resolvedTheme, theme]);

  useEffect(() => {
    let cancelled = false;

    changiconTheme
      .getValue()
      .then((savedTheme) => {
        // Don't overwrite a choice made while storage was loading.
        if (!cancelled && !userChangedTheme.current && savedTheme) {
          setThemeState(savedTheme);
        }
      })
      .catch((error) => log('error', 'Failed to read the theme', error));

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => setSystemTheme(getSystemTheme());

    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, []);

  const setTheme = useCallback((nextTheme: Theme) => {
    userChangedTheme.current = true;
    setThemeState(nextTheme);
    mirrorTheme(nextTheme);
    void changiconTheme
      .setValue(nextTheme)
      .catch((error) => log('error', 'Failed to save the theme', error));
  }, []);

  const value = useMemo(
    () => ({ theme, resolvedTheme, setTheme }),
    [resolvedTheme, setTheme, theme],
  );

  return (
    <ThemeProviderContext.Provider value={value}>{children}</ThemeProviderContext.Provider>
  );
}
