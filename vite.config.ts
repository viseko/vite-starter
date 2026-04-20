import { defineConfig } from "vite";

import { resolve } from "path";

import { buildServer, buildPlugins } from "./app/modules/_index";

import purgecss from "@fullhuman/postcss-purgecss";

const PROJECT_NAME = "vite-starter";

export default defineConfig(({ mode }) => {
  const IS_DEV = mode === "development";
  const BASE_URL = IS_DEV ? "" : `/${PROJECT_NAME}`;

  return {
    root: "src",
    publicDir: resolve(__dirname, "public"),
    base: BASE_URL,
    resolve: {
      alias: {
        "@": resolve(__dirname, "src"),
        "@img": resolve(__dirname, "src/assets/img"),
        "@fonts": resolve(__dirname, ""),
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
        TIMESTAMP: Date.now().toString(32),
      },
    }),
    build: {
      outDir: "../build",
      emptyOutDir: true,
      assetsDir: "assets",
      polyfillModulePreload: false,
      rollupOptions: {
        input: {
          main: resolve(__dirname, "src/main.ts"),
          styles: resolve(__dirname, "src/main.scss"),
        },
        output: {
          entryFileNames: "assets/js/[name].min.js",
          chunkFileNames: "assets/js/chunks/[name].js",
          assetFileNames: (assetInfo: any) =>
            assetInfo.name?.endsWith(".css")
              ? `assets/css/main.min[extname]`
              : "assets/[name][extname]",
        },
        plugins: [
          {
            name: "fix-css-font-paths",
            generateBundle(_options, bundle) {
              for (const fileName in bundle) {
                const chunk = bundle[fileName];
                if (chunk.type === "asset" && fileName.endsWith(".css")) {
                  if (typeof chunk.source === "string") {
                    chunk.source = chunk.source.replace(/url\(assets\//g, "url(../assets/");
                  }
                }
              }
            },
          },
        ],
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          // Скрываем уведомления об устаревающих функциях
          silenceDeprecations: ["import", "global-builtin"],
          // Делаем везде видимыми SCSS-переменные
          additionalData: `@import "@/shared/styles/variables.scss";`,
        },
      },
      postcss: {
        plugins: IS_DEV
          ? []
          : [
              purgecss({
                content: [
                  "./src/**/*.html",
                  "./src/**/*.pug",
                  "./src/**/*.ts",
                  "./src/**/*.tsx",
                  "./src/**/*.js",
                  "./src/**/*.jsx",
                ],
                safelist: {
                  // Сохраняем динамические классы и состояния
                  standard: [/^swiper/, /^is-/, /^has-/, /^active/, /^show/, /^hide/],
                  deep: [/^swiper/, /^accordion/],
                  greedy: [/^data-/],
                },
                // Удаляем неиспользуемые keyframes и CSS-переменные
                keyframes: true,
                variables: true,
                // Более агрессивная очистка для утилитарных классов
                defaultExtractor: (content: string) => {
                  const broadMatches = content.match(/[^<>"'`\s]*[^<>"'`\s:]/g) || [];
                  const innerMatches = content.match(/[^<>"'`\s.()]*[^<>"'`\s.():]/g) || [];
                  return [...broadMatches, ...innerMatches];
                },
              }),
            ],
      },
    },
    server: buildServer(),
  };
});
