 import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  // Safe check to see if DISABLE_HMR exists without crashing Vite 6
  const disableHmr = typeof process !== 'undefined' && process.env && process.env.DISABLE_HMR === 'true';

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // Safely uses our checked variable
      hmr: !disableHmr,
      watch: disableHmr ? null : {},
    },
  };
});


