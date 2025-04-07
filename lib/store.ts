const changiconTheme = storage.defineItem<string>(
  'local:changicon-theme',
  {
    fallback: 'system'
  }
);

export {
  changiconTheme
}