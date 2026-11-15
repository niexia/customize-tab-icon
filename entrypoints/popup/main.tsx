import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import '@/styles/globals.css';
import { applyThemeClass, readMirroredTheme } from '@/lib/theme';

// Apply the last known theme before React's first paint to avoid a flash.
applyThemeClass(readMirroredTheme() ?? 'system');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
