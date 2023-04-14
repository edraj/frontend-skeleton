<script context="module" lang="ts">
  import { Router, createRouter } from "@roxi/routify";
  import routes from "../.routify/routes.default.js";
  import { SvelteToast } from "@zerodevx/svelte-toast";

  const router = createRouter({ routes });
  const options = {
    duration: 2500, // duration of progress bar tween to the `next` value
    initial: 1, // initial progress bar value
    next: 0, // next progress value
    pausable: false, // pause progress bar tween on mouse hover
    dismissable: true, // allow dismiss with close button
    reversed: false, // insert new toast to bottom of stack
    intro: { x: 256 }, // toast intro fly animation settings
    theme: {
      "--toastColor": "mintcream",
    }, // css var overrides
    classes: ['custom-toast'], // user-defined classes
  };
</script>


<script lang="ts">
  import { setupI18n, dir } from "./i18n";

  setupI18n();
  $: {
    try {
      document.dir = $dir;
      if ($dir == "rtl") {
        document.head.children["bootstrap"].href =
          "/assets/bootstrap.rtl.min.css";
      } else {
        if(document && document.head && document.head.children["bootstrap"])
          document.head.children["bootstrap"].href = "/assets/bootstrap.min.css";
      }
    } catch (error) {
      console.log("Error in App:", error);
    }
  }
</script>

<style>
  :global(.custom-toast.info) {
    --toastBackground: rgba(72, 187, 120, 0.9);
    --toastBarBackground: #2F855A;
  }
  :global(.custom-toast.warn) {
    --toastBackground: #bb4848e6;
    --toastBarBackground: #852f2f;
  }
</style>

<div id="routify-app">
  <SvelteToast {options} />
  <Router {router} />
</div>
