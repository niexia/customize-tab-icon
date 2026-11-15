import { storage } from 'wxt/utils/storage';
import type { Theme } from './theme';
import type { IconBackground } from './icon-image';

export const changiconTheme = storage.defineItem<Theme>('local:changicon-theme', {
  fallback: 'system',
});

export const changiconBackground = storage.defineItem<IconBackground>(
  'local:changicon-background',
  {
    fallback: 'white',
  },
);
