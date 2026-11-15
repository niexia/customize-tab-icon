import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite';

// See https://wxt.dev/api/config.html
export default defineConfig({
  browser: 'chrome',
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'Changicon',
    description:
      'Give any tab a custom icon — emoji, text, line icons, or your own image. Apply it to one page or a whole site.',
    permissions: ['storage', 'activeTab', 'scripting'],
    host_permissions: ['*://*/*'],
  },
  vite: () => ({
    plugins: [tailwindcss()],
  }),
});
