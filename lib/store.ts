import { storage } from 'wxt/storage'

const changiconTheme = storage.defineItem<string>(
  'local:changicon-theme',
  {
    fallback: 'system'
  }
);

interface IconInfo {
  customIcon: string
}

type HostIcons = Record<string, Record<string, IconInfo>>

const changiconLocal = storage.defineItem<HostIcons>(
  'local:changicon-local',
  {
    fallback: {}
  }
)

const changeiconSync = storage.defineItem<HostIcons>(
  'sync:changeicon-sync'
)

export {
  changiconTheme,
  changiconLocal,
  changeiconSync,
}