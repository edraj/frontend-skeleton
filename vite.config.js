import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import preprocess from "svelte-preprocess";
import routify from "@roxi/routify/vite-plugin";
import { mdsvex } from "mdsvex";

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
        if (warning.code === "a11y-click-events-have-key-events")// && warning.filename?.startsWith("/node_modules/sveltestrap"))
          return;
        defaultHandler(warning);
      },
    }),
  ],
  build: {
    chunkSizeWarningLimit: 900,
    outDir: "./dist/",
  },
  server: { port: 1337 },
})
