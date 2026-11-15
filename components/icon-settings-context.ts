import { createContext, useContext } from 'react';
import type { IconBackground } from '@/lib/icon-image';

export type IconSettings = {
  background: IconBackground;
  setBackground: (background: IconBackground) => void;
};

export const IconSettingsContext = createContext<IconSettings | undefined>(undefined);

export function useIconSettings(): IconSettings {
  const context = useContext(IconSettingsContext);

  if (!context) {
    throw new Error('useIconSettings must be used within an IconSettingsProvider');
  }

  return context;
}
