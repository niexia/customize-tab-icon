import { useCallback, useEffect, useMemo, useState } from 'react';
import { changiconBackground, changiconScope } from '@/lib/store';
import type { IconBackground } from '@/lib/icon-image';
import type { IconScope } from '@/lib/icon-key';
import { log } from '@/lib/utils';
import { IconSettingsContext } from './icon-settings-context';

type IconSettingsProviderProps = {
  children: React.ReactNode;
};

export function IconSettingsProvider({ children }: IconSettingsProviderProps) {
  const [background, setBackgroundState] = useState<IconBackground>('white');
  const [scope, setScopeState] = useState<IconScope>('page');

  useEffect(() => {
    let cancelled = false;

    void Promise.all([changiconBackground.getValue(), changiconScope.getValue()])
      .then(([backgroundValue, scopeValue]) => {
        if (cancelled) return;
        setBackgroundState(backgroundValue);
        setScopeState(scopeValue);
      })
      .catch((error) => log('error', 'Failed to read the icon settings', error));

    const unwatchBackground = changiconBackground.watch((value) => {
      setBackgroundState(value);
    });
    const unwatchScope = changiconScope.watch((value) => {
      setScopeState(value);
    });

    return () => {
      cancelled = true;
      unwatchBackground();
      unwatchScope();
    };
  }, []);

  const setBackground = useCallback((value: IconBackground) => {
    setBackgroundState(value);
    void changiconBackground
      .setValue(value)
      .catch((error) => log('error', 'Failed to save the icon background', error));
  }, []);

  const setScope = useCallback((value: IconScope) => {
    setScopeState(value);
    void changiconScope
      .setValue(value)
      .catch((error) => log('error', 'Failed to save the icon scope', error));
  }, []);

  const value = useMemo(
    () => ({ background, setBackground, scope, setScope }),
    [background, scope, setBackground, setScope],
  );

  return <IconSettingsContext.Provider value={value}>{children}</IconSettingsContext.Provider>;
}
