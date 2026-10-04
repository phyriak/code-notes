import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      babel({ presets: [reactCompilerPreset()] }),
    ],

    server: {
      proxy: {
        '/api': {
          target: env.production.VITE_BACKEND_URL,
          changeOrigin: true,
        },
      },
    },
  };
});