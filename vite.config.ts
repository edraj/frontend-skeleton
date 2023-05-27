/// <reference types="vitest" />
import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import preprocess from "svelte-preprocess";
import routify from "@roxi/routify/vite-plugin";
import { mdsvex } from "mdsvex";
// import { svelteInspector } from '@sveltejs/vite-plugin-svelte-inspector';
// import path from "path";

const production = process.env.NODE_ENV === "production";

export default defineConfig({
  clearScreen: false,
  resolve: {
    alias: {
      /*'@': path.resolve(__dirname, './src'),*/
      '@':  process.cwd() + '/src'
    },
  },
  /*resolve: {
    alias: {
      $root: path.resolve('./src')
    }
  },*/
  plugins: [
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
      preprocess: [
        preprocess(), 
        mdsvex({ extension: "md" })
      ],
      onwarn: (warning, defaultHandler) => {
        // Ignore a11y-click-events-have-key-events warning from sveltestrap
        if ( warning.code === "a11y-click-events-have-key-events" || warning.filename?.startsWith("/node_modules/svelte-jsoneditor"))
          return;
        if(typeof defaultHandler != "undefined")
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
