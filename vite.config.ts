import { VitePWA } from "vite-plugin-pwa";
/// <reference types="vitest" />
import { defineConfig } from "vite";
import { mdsvex } from "mdsvex";
import preprocess from "svelte-preprocess";
import routify from "@roxi/routify/vite-plugin";
import { svelte } from "@sveltejs/vite-plugin-svelte";
// import { svelteInspector } from '@sveltejs/vite-plugin-svelte-inspector';
// import path from "path";

const production = process.env.NODE_ENV === "production";

export default defineConfig({
  clearScreen: false,
  resolve: {
    alias: {
      /*'@': path.resolve(__dirname, './src'),*/
      "@": process.cwd() + "/src",
    },
  },
  /*resolve: {
    alias: {
      $root: path.resolve('./src')
    }
  },*/
  plugins: [
    VitePWA({
      injectRegister: "auto",
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,woff2,ts,svelte}"],
        clientsClaim: true,
        skipWaiting: true,
        runtimeCaching: [
          {
            urlPattern: /\/management\/content/i,
            handler: "CacheFirst",
            options: {
              cacheName: "management-content-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // <== 365 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
      registerType: "autoUpdate",
      manifest: {
        background_color: "#ffffff",
        theme_color: "#7E1F86",
        name: "Unixfy.net",
        short_name: "Unixfy.net",
        start_url: "/",
        display: "standalone",
        icons: [
          {
            src: "/images/largeicon.png",
            sizes: "1000x1000",
            type: "image/png",
            purpose: "maskable any",
          },
        ],
      },
      devOptions: {
        enabled: true,
      },
    }),
    /*svelteInspector({
            // toggleKeyCombo: 'meta-shift',
      showToggleButton: 'always',
      toggleButtonPos: 'bottom-right'
    }),*/
    routify({
      ssr: { enable: false },
    }),
    svelte({
      compilerOptions: {
        dev: !production,
        hydratable: !!process.env.ROUTIFY_SSR_ENABLE,
      },
      extensions: [".md", ".svelte"],
      preprocess: [preprocess(), mdsvex({ extension: "md" })],
      onwarn: (warning, defaultHandler) => {
        // Ignore a11y-click-events-have-key-events warning from sveltestrap
        if (
          warning.code === "a11y-click-events-have-key-events" ||
          warning.filename?.startsWith("/node_modules/svelte-jsoneditor")
        )
          return;
        if (typeof defaultHandler != "undefined") defaultHandler(warning);
      },
    }),
  ],
  build: {
    chunkSizeWarningLimit: 900,
  },
  server: { port: 1337 },
  test: {
    environment: "jsdom",
    globals: true,
  },
  ssr: {
    noExternal: ["@popperjs/core"],
  },
});
