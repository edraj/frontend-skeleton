<script lang="ts">
  import { active_section } from "../_stores/active_section.js";
  import Icon from "../../_components/Icon.svelte";
  import { _ } from "../../../i18n";
  import { status_line } from "../_stores/status_line.js";
  import { ListGroup, ListGroupItem } from "sveltestrap";
  import Spaces from "./sidebar/Spaces.svelte";
  import Profile from "./sidebar/Profile.svelte";
  import Folder from "./Folder.svelte";
  import { isActive } from "@roxi/routify";
  import { ResourceType, get_spaces } from "../../../dmart";

  const components = {
    spaces: Spaces,
    profile: Profile,
  };

  let head_height: number;
  let foot_height: number;
  let spaces = [];
  const withSpaces = ["events", "qatool"];

  $: {
    async function getSpaces() {
      spaces = (await get_spaces()).records;
    }
    getSpaces();
  }
</script>

<div bind:clientHeight={head_height} class="p-2">
  <h5 class="mt-0 mb-2">
    {#if $active_section.icon}<Icon
        name={$active_section.icon}
        class="pe-1"
      />{/if}
    {#if $active_section.name}{$_($active_section.name)}{/if}
  </h5>
  <hr class="w-100 mt-1 mb-0 py-1" />
</div>
<div
  class="no-bullets scroller pe-0 w-100"
  style="height: calc(100% - {head_height +
    foot_height}px); overflow: hidden auto;"
>
  <ListGroup flush class="w-100">
    {#each $active_section.children as child ($active_section.name + child.name)}
      {#if child.type == "component" && child.name in components}
        <svelte:component this={components[child.name]} />
      {:else if child.type == "link"}
        <!--p class="my-0 font-monospace"><small>{JSON.stringify(child, undefined,1)}</small></p-->
        <ListGroupItem
          color="light"
          action
          href={`/management/${$active_section.name}/${child.name}`}
          active={$isActive(
            `/management/${$active_section.name}/${child.name}`
          )}
        >
          {#if child.icon}<Icon name={child.icon} class="pe-1" />{/if}
          {$_(child.name)}
          {#if withSpaces.includes(child.name) && $active_section.name === "tools"}
            {#each spaces as space}
              <ListGroupItem class="ps-2 pe-0 py-0">
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <div
                  class="mb-2"
                  style="cursor: pointer;"
                  on:click={async () => {
                    window.history.replaceState(
                      history.state,
                      "",
                      `/management/tools/${child.name}/${space.shortname}`
                    );
                  }}
                >
                  <b>{space.shortname}</b>
                </div>
              </ListGroupItem>
            {/each}
          {/if}
        </ListGroupItem>
      {:else if child.type == "folder"}
        <ListGroupItem class="px-0">
          {#if child.icon}<Icon name={child.icon} class="pe-1" />{/if}
          {$_(child.name)}
          <Folder
            space_name={child.space_name}
            folder={{
              shortname: child.shortname,
              subpath: child.subpath,
              resource_type: ResourceType.folder,
              attributes: {},
            }}
          />
        </ListGroupItem>
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
