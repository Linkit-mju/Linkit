import {defineConfig} from 'vitest/config';
import react from '@vitejs/plugin-react';
import {loadEnv} from 'vite';

export default defineConfig(({command, mode}) => {
  const {API_PROXY_TARGET} = loadEnv(mode, '.', '');

  if (command === 'serve' && mode !== 'test' && !API_PROXY_TARGET) {
    throw new Error('API_PROXY_TARGET must be set in frontend/.env');
  }

  return {
    plugins: [react()],
    server: {
      proxy: API_PROXY_TARGET
        ? {
            '/api': {
              target: API_PROXY_TARGET,
              changeOrigin: true,
            },
          }
        : undefined,
    },
    test: {
      environment: 'jsdom',
      include: ['tests/integration/**/*.{test,spec}.{ts,tsx}'],
      setupFiles: ['./tests/setup.ts'],
    },
  };
});
