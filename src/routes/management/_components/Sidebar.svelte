<script lang="ts">
  import { query, QueryType, RequestType, ResourceType } from "../../../dmart";
  import { active_section } from "../_stores/active_section.js";
  // import { active_entry } from "../_stores/active_entry.js";
  import Folder from "./Folder.svelte";
  import Icon from "../../_components/Icon.svelte";
  import { _ } from "../../../i18n";
  import { url, isActive } from "@roxi/routify";
  import { entries } from "../_stores/entries.js";
  import { status_line } from "../_stores/status_line.js";
  import {active_space} from "../_stores/active_space";
  import { ListGroup, ListGroupItem } from "sveltestrap";
  import Spaces from "./sidebar/Spaces.svelte"

  const components = {
    spaces: Spaces
  };

  let head_height : number;
  let foot_height : number;
</script>

<div bind:clientHeight={head_height}>
  <h5 class="my-0">
    {#if $active_section.icon}<Icon name={$active_section.icon} class="pe-1" />{/if}
    {#if $active_section.name}{$_($active_section.name)}{/if}
  </h5>
  <hr class="w-100 mt-1 mb-0" />
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
  <!--
  {#if $active_entry.data}
    <hr class="my-0" />
    <p class="lh-1 my-0">
      <small>
        <span class="text-muted">{$_("path")}:</span>
        {$active_entry.data.subpath}/{$active_entry.data.shortname} <br />
        <span class="text-muted">{$_("displayname")}:</span>
        {$active_entry.data.displayname} <br />
        <span class="text-muted">{$_("content_type")}:</span>
        {$active_entry?.data?.attributes?.payload?.content_type?.split(";")[0] || "uknown"}
      </small>
    </p>
  {/if}
  {#if $status_line}
    <hr class="my-1" />
    {@html $status_line}
  {/if}
-->
</div>
