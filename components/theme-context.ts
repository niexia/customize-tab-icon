import { createContext, useContext } from 'react';
import type { ResolvedTheme, Theme } from '@/lib/theme';

export type ThemeProviderState = {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
};

export const ThemeProviderContext = createContext<ThemeProviderState | undefined>(undefined);

export function useTheme(): ThemeProviderState {
  const context = useContext(ThemeProviderContext);

  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
}
