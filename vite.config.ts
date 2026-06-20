import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
// On GitHub Pages the site is served from /finance-portal/, so use that as the
// production base. Local dev/preview keep the root base.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/finance-portal/' : '/',
  plugins: [react(), tailwindcss()],
}));
