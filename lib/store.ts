import { storage } from 'wxt/utils/storage';
import type { Theme } from './theme';
import type { IconBackground } from './icon-image';
import type { IconScope } from './icon-key';

export const changiconTheme = storage.defineItem<Theme>('local:changicon-theme', {
  fallback: 'system',
});

export const changiconBackground = storage.defineItem<IconBackground>(
  'local:changicon-background',
  {
    fallback: 'white',
  },
);

export const changiconScope = storage.defineItem<IconScope>('local:changicon-scope', {
  fallback: 'page',
});
