<script lang="ts">
  import { params } from "@roxi/routify";
  import SpaceRenderer from "@/components/management/SpaceRenderer.svelte";
  import spaces from "@/stores/management/spaces";
</script>

{#key $params.space_name}
  {#if $params.space_name && spaces.is_loaded()}
    <SpaceRenderer bind:space_name={$params.space_name} />
    <!--pre>{JSON.stringify(spaces.get($params.space_name), null, 2)}</pre-->
  {:else}
    <h4>For some reason ... params doesn't have the needed info</h4>
    <pre>{JSON.stringify($params, null, 2)}</pre>
  {/if}
{/key}
