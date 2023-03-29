import { svelte } from "@sveltejs/vite-plugin-svelte";
import routify from "@roxi/routify/vite-plugin";
import { defineConfig } from "vite";
import { mdsvex } from "mdsvex";
import preprocess from "svelte-preprocess";

const production = process.env.NODE_ENV === "production";

export default defineConfig({
  clearScreen: false,

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
        // This ignore can be removed after this issue is closed https://github.com/bestguy/sveltestrap/issues/509.
        if (warning.code === "a11y-click-events-have-key-events") return; // && warning.filename?.startsWith("/node_modules/sveltestrap")) return;
        defaultHandler(warning);
      },
    }),
  ],

  server: { port: 1337 },
})
