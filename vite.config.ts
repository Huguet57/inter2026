import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

import {
  DEFAULT_API_PORT,
  DEFAULT_CLIENT_PORT,
  parsePort,
  resolveSiteUrl,
  trimTrailingSlash,
} from './config/runtimeConfig';

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const clientPort = parsePort(env.VITE_PORT, DEFAULT_CLIENT_PORT);
  const apiPort = parsePort(env.PORT, DEFAULT_API_PORT);
  const packageSiteUrl = trimTrailingSlash(process.env.npm_package_homepage ?? '');
  const defaultSiteUrl =
    command === 'build' && packageSiteUrl
      ? packageSiteUrl
      : `http://localhost:${clientPort}`;
  const siteUrl = resolveSiteUrl(env.VITE_SITE_URL, defaultSiteUrl);

  return {
    base: '/',
    plugins: [
      react(),
      {
        name: 'inject-site-url',
        transformIndexHtml(html) {
          return html.replace(/__SITE_URL__/g, siteUrl);
        },
      },
    ],
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    server: {
      port: clientPort,
      proxy: {
        '/api': {
          target: `http://localhost:${apiPort}`,
          changeOrigin: true,
        },
      },
    },
  };
});
