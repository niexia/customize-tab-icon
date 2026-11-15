import { createContext, useContext } from 'react';
import type { IconBackground } from '@/lib/icon-image';
import type { IconScope } from '@/lib/icon-key';

export type IconSettings = {
  background: IconBackground;
  setBackground: (background: IconBackground) => void;
  scope: IconScope;
  setScope: (scope: IconScope) => void;
};

export const IconSettingsContext = createContext<IconSettings | undefined>(undefined);

export function useIconSettings(): IconSettings {
  const context = useContext(IconSettingsContext);

  if (!context) {
    throw new Error('useIconSettings must be used within an IconSettingsProvider');
  }

  return context;
}
