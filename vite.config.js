/// <reference types="vitest" />
import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import preprocess from "svelte-preprocess";
import routify from "@roxi/routify/vite-plugin";
import { mdsvex } from "mdsvex";
import path from 'path';

// import path from "path";

const production = process.env.NODE_ENV === "production";

export default defineConfig({
  clearScreen: false,
  resolve: {
    alias: {
      /*'@': path.resolve(__dirname, './src'),*/
      '@':  process.cwd() + '/src',
		'~bootstrap': path.resolve(__dirname, 'node_modules/bootstrap/dist/css/'),
		'~bootstrap-icons': path.resolve(__dirname, 'node_modules/bootstrap-icons/'),
    },
  },
  /*resolve: {
    alias: {
      $root: path.resolve('./src')
    }
  },*/
  plugins: [
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
        if (warning.code === "a11y-click-events-have-key-events" || warning.filename?.startsWith("/node_modules/svelte-jsoneditor"))
          return;
        defaultHandler(warning);
      },
    }),
  ],
  build: {
    chunkSizeWarningLimit: 900
  },
  server: { port: 1337 },
  test: {
      environment: 'jsdom',
      globals: true,
  },
  ssr: {
		noExternal: ['@popperjs/core']
	}
})
