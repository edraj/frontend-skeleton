<script lang="ts">
  import Icon from "../../_components/Icon.svelte";
  import { _ } from "../../../i18n";
  import {
    ApiResponseRecord,
    get_children,
    ResourceType,
  } from "../../../dmart";

  let expanded = false;

  export let space_name: string;
  export let parent_subpath: string;
  export let folder: ApiResponseRecord;

  function displayname(): string {
    return folder.shortname;
  }

  async function toggle() {
    expanded = !expanded;
  }

  function set_url(): boolean {
    let subpath = `${parent_subpath}/${folder.shortname}`.replace(/\/+/g, "/");

    // Trim leading or traling '/'
    if (subpath.length > 0 && subpath[0] === "/")
      subpath = subpath.substring(1);
    if (subpath.length > 0 && subpath[subpath.length - 1] === "/")
      subpath = subpath.slice(0, -1);

    // If empty, use __root__ magic word
    if (subpath.length === 0) subpath = "__root__";

    window.history.replaceState(
      history.state,
      "",
      `/management/content/${space_name}/${subpath.replaceAll("/", "-")}`
    );

    return true;
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
    {#await get_children( space_name, `${parent_subpath}/${folder.shortname}`, 10, 0, [ResourceType.folder] )}
      <!--h6> Loading children of {parent_subpath}/{folder.shortname} </h6-->
    {:then children_data}
      <!--pre> expanded {children_data.records.length}</pre-->
      {#if children_data.records.length > 0}
        {#each children_data.records as child}
          <li>
            <svelte:self
              folder={child}
              {space_name}
              parent_subpath={`${parent_subpath}/${folder.shortname}`}
            />
          </li>
        {/each}
      {:else if set_url()}
        <!-- -->
      {/if}
    {/await}
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
