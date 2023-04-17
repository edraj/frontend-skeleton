<script lang="ts">
  export let content_type : string = "";
  export let url : string;
  export let displayname : string = undefined;
</script>

{#if content_type.includes("image")}
  <img src="{url}" alt="{displayname}" class="mw-100 border" />
{:else if content_type.includes("audio")}
  <audio controls src="{url}">
    <track kind="captions" />
  </audio>
{:else if content_type.includes("video")}
  <video controls src="{url}">
    <track kind="captions" />
  </video>
{:else if content_type.includes("pdf")}
  <div class="h-100 w-100 vh-100 embed-responsive embed-responsive-16by9" style="overflow: hidden hidden;">
    <object title="{displayname}" class="h-100 w-100 embed-responsive-item" type="application/pdf" style="height: 100vh;" data="{url}">
      <p>For some reason PDF is not rendered here properly.</p>
    </object>
  </div>
{:else}
  <a href="{url}" title="{displayname}">link {displayname}</a>
{/if}
