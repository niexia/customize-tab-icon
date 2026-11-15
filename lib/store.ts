import { storage } from 'wxt/utils/storage';
import type { Theme } from './theme';

export const changiconTheme = storage.defineItem<Theme>('local:changicon-theme', {
  fallback: 'system',
});
