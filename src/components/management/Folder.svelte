<script lang="ts">
  import Icon from "../Icon.svelte";
  import { _ } from "@/i18n";
  import { goto } from "@roxi/routify";
  import {
    ApiResponseRecord,
    get_children,
    ResourceType,
  } from "@/dmart";

  let expanded = false;

  export let space_name: string;
  export let folder: ApiResponseRecord;

  let children = [];

  function displayname(): string {
    const lang = JSON.parse(localStorage.getItem("preferred_locale"));
    if (folder?.attributes?.displayname) {
      return folder?.attributes?.displayname[lang];
    } else {
      return folder.shortname;
    }
  }

  async function toggle() {
    expanded = !expanded;
    if (expanded) {
      const data = await get_children(
        space_name,
        `${folder.subpath}/${folder.shortname}`,
        10,
        0,
        [ResourceType.folder]
      );
      children = data.records;

      let subpath = `${folder.subpath}/${folder.shortname}`.replace(
        /\/+/g,
        "/"
      );

      // Trim leading or traling '/'
      if (subpath.length > 0 && subpath[0] === "/")
        subpath = subpath.substring(1);
      if (subpath.length > 0 && subpath[subpath.length - 1] === "/")
        subpath = subpath.slice(0, -1);

      // If empty, use __root__ magic word
      if (subpath.length === 0) subpath = "__root__";

      $goto("/management/content/[space_name]/[subpath]", {
        space_name: space_name,
        subpath: subpath.replaceAll("/", "-"),
      });
    }
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<span
  class:expanded
  class="folder position-relative mt-1 ps-2"
  on:click={toggle}
>
  <span style="overflow: hidden;">
    <Icon class="text-start" name="folder{expanded ? '2-open' : ''}" />
    {displayname()}
  </span>
  <span class="toolbar top-0 end-0 position-absolute px-0">
    <span
      class="px-0"
      title={$_("edit")}
      on:click|stopPropagation={() => console.log("fixme")}
    >
      <Icon name="pencil" />
    </span>
  </span>
</span>

{#if expanded}
  <ul class="py-1 ps-1 ms-2 border-start">
    {#if children.length > 0}
      {#each children as child}
        <li>
          <svelte:self folder={child} {space_name} />
        </li>
      {/each}
    {/if}
  </ul>
{/if}

<style>
  .folder {
    /*font-weight: bold;*/
    cursor: pointer;
    display: list-item;
    list-style: none;
    /*border-top: thin dotted grey;*/
  }

  .folder:hover {
    z-index: 2;
    color: #495057;
    text-decoration: none;
    /*background-color: #e8e9ea;*/
  }

  .expanded {
    background-color: #e8e9ea;
    /*border-bottom: thin dotted green;*/
  }

  ul {
    list-style: none;
  }

  li {
    padding: 0;
  }

  .toolbar {
    display: none;
    color: brown;
  }

  .toolbar span:hover {
    color: green;
  }

  .folder:hover .toolbar {
    display: flex;
  }
</style>
