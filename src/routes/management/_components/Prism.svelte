<script lang="ts">
  import Prism from 'prismjs';
  import 'prismjs/components/prism-json';

  export let language : string = "json";

  export let code ;

  let formatted : string = Prism.highlight(JSON.stringify(code, undefined, 1), Prism.languages[language]);
  // JSON.stringify(code, undefined, 2); 

</script>

<pre class="language-{language}"  data-output="2-17"><code class="language-{language}">{@html formatted}</code></pre>

<style global>
  /*@import "highlight.js/styles/a11y-light.css";*/
  @import "prismjs/plugins/line-numbers/prism-line-numbers.css";
  @import "prismjs/plugins/command-line/prism-command-line.css";
  @import "prismjs/plugins/line-highlight/prism-line-highlight.css";
  @import "prismjs/themes/prism.css";
  @import "prismjs/themes/prism-coy.css";
</style>
