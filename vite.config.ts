import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    // This repo's static folder is committed as "Public" (capital P), but Vite's
    // default is "public". Windows is case-insensitive so it resolves locally,
    // while Linux CI builders (Vercel, Netlify) are case-sensitive and silently
    // skip the copy — leaving dist/ with no img/ or resume.pdf. State it
    // explicitly so the build is identical on every platform.
    publicDir: 'Public',
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      proxy: {
        // Keeps the GitHub token server-side during local dev. Run `npm run server` alongside.
        '/api': {
          target: `http://localhost:${env.PORT || 8787}`,
          changeOrigin: true,
        },
      },
    },
  };
});
