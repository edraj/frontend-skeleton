<script lang="ts">
  import { active_section } from "../_stores/active_section.js";
  import Icon from "../../_components/Icon.svelte";
  import { _ } from "../../../i18n";
  import { status_line } from "../_stores/status_line.js";
  import { ListGroup, ListGroupItem } from "sveltestrap";
  import Spaces from "./sidebar/Spaces.svelte"

  const components = {
    spaces: Spaces
  };

  let head_height : number;
  let foot_height : number;
</script>

<div bind:clientHeight={head_height} class="p-2">
  <h5 class="mt-0 mb-2">
    {#if $active_section.icon}<Icon name={$active_section.icon} class="pe-1" />{/if}
    {#if $active_section.name}{$_($active_section.name)}{/if}
  </h5>
  <hr class="w-100 mt-1 mb-0 py-1" />
</div>
<div
  class="no-bullets scroller pe-0 w-100"
  style="height: calc(100% - {head_height + foot_height}px); overflow: hidden auto;">
  <ListGroup flush class="w-100">
    {#each $active_section.children as child ($active_section.name + child.name)}
      {#if child.type == "component" && child.name in components}
        <svelte:component this={components[child.name]} />
      {/if}
    {/each}
  </ListGroup>
</div>
<div class="w-100" bind:clientHeight={foot_height}>
  {#if $status_line}
    <hr class="my-1" />
    {@html $status_line}
  {/if}
</div>
