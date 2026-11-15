import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite'

// See https://wxt.dev/api/config.html
export default defineConfig({
  browser: 'chrome',
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'Changicon',
    description: 'An extension that allows you to customize website icons (tab icons).',
    permissions: ['storage', 'activeTab', 'scripting'],
  },
  vite: () => ({
    plugins: [tailwindcss()],
  }),
});
