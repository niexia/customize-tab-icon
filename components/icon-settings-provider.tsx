import { useCallback, useEffect, useMemo, useState } from 'react';
import { changiconBackground } from '@/lib/store';
import type { IconBackground } from '@/lib/icon-image';
import { log } from '@/lib/utils';
import { IconSettingsContext } from './icon-settings-context';

type IconSettingsProviderProps = {
  children: React.ReactNode;
};

export function IconSettingsProvider({ children }: IconSettingsProviderProps) {
  const [background, setBackgroundState] = useState<IconBackground>('white');

  useEffect(() => {
    let cancelled = false;

    changiconBackground
      .getValue()
      .then((value) => {
        if (!cancelled) setBackgroundState(value);
      })
      .catch((error) => log('error', 'Failed to read the icon background', error));

    const unwatch = changiconBackground.watch((value) => {
      setBackgroundState(value);
    });

    return () => {
      cancelled = true;
      unwatch();
    };
  }, []);

  const setBackground = useCallback((value: IconBackground) => {
    setBackgroundState(value);
    void changiconBackground
      .setValue(value)
      .catch((error) => log('error', 'Failed to save the icon background', error));
  }, []);

  const value = useMemo(() => ({ background, setBackground }), [background, setBackground]);

  return <IconSettingsContext.Provider value={value}>{children}</IconSettingsContext.Provider>;
}
