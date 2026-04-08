import { defineConfig } from 'vite';

import { resolve } from 'path';

import {
  buildServer,
  buildPlugins
} from "./app/modules/_index";

const PROJECT_NAME = "my_proj";

export default defineConfig(({ mode }) => {
  const IS_DEV = (mode === 'development');
  const BASE_URL = IS_DEV ? "" : `/${PROJECT_NAME}`;

  return {
    root: 'src',
    publicDir: resolve(__dirname, 'public'),
    base: BASE_URL,
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        "@img": resolve(__dirname, "src/assets/img"),
        "@fonts": resolve(__dirname, "")
      },
    },
    plugins: buildPlugins({
      locals: {
        IS_DEV,
        BASE_URL,
        PATH: {
          img: `${BASE_URL}/assets/img`,
          fonts: `${BASE_URL}/assets/fonts`,
          video: `${BASE_URL}/assets/video`,
          json: `${BASE_URL}/assets/json`,
        },
        TIMESTAMP: Date.now().toString(32)
      },
    }),
    build: {
      outDir: '../build',
      emptyOutDir: true,
      assetsDir: 'assets',
      polyfillModulePreload: false,
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'src/main.ts'),
          // styles: resolve(__dirname, 'src/main.scss'),
        },
        output: {
          entryFileNames: 'assets/js/[name].min.js',
          chunkFileNames: 'assets/js/chunks/[name].js',
          assetFileNames: (assetInfo: any) =>
            assetInfo.name?.endsWith('.css')
              ? `assets/css/main.min[extname]`
              : 'assets/[name][extname]',
        },
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          // Скрываем уведомления об устаревающих функциях
          silenceDeprecations: ['import', 'global-builtin'],
        },
      },
    },
    server: buildServer(),
  };
});
