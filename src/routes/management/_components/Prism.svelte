<script lang="ts">
  import Prism from "prismjs";
  import "prismjs/components/prism-json";

  export let language: string = "json";
  export let code: Object;
  let formatted: string;
  $: {
    formatted = Prism.highlight(
      JSON.stringify(code, undefined, 1),
      Prism.languages[language],
      language
    );
  }
</script>

<pre class="language-{language}" data-output="2-17"><code
    class="language-{language}">{@html formatted}</code
  ></pre>

<style global>
  @import "prismjs/themes/prism.css";
  @import "prismjs/themes/prism-coy.css";

  pre {
    font-size: 80% !important;
  }
</style>
