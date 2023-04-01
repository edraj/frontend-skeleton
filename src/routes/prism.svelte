<script>
  import Prism from 'prismjs';
  let code = `console.log('Hello world')`;
  let language = 'javascript';
</script>

<div class="code">
  {@html Prism.highlight(code, Prism.languages[language])}
</div>

<svelte:head>
  <link href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.22.0/themes/prism.min.css" rel="stylesheet" />
</svelte:head>

<style>
  .code {
    white-space: pre-wrap;
  }
</style>
