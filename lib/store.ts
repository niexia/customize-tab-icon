import { storage } from 'wxt/storage'

const changiconTheme = storage.defineItem<string>(
  'local:changicon-theme',
  {
    fallback: 'system'
  }
);

interface IconInfo {
  pageHost: string;
  defaultIcon: string;
  customIcon?: string;
}

const changiconLocal = storage.defineItem<Record<string, IconInfo>>(
  'local:changicon-local',
  {
    fallback: {}
  }
)

const changeiconSync = storage.defineItem<object>(
  'sync:changeicon-sync'
)

export {
  changiconTheme,
  changiconLocal,
  changeiconSync,
}