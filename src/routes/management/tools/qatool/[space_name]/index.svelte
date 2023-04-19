<script>
  import { params } from "@roxi/routify";
  import { ListGroup, ListGroupItem } from "sveltestrap";
  import "bootstrap";
  import { get_space_health } from "../../../../../dmart";

  let isLoading;
  let subpaths = {};
  $: {
    async function updateSpaceHealthCheck() {
      isLoading = true;
      const response = await get_space_health($params.space_name);
      isLoading = false;
      if (response.status === "success") {
        subpaths = response.attributes.folders_report;
      }
    }
    updateSpaceHealthCheck();
  }
</script>

<div class="mx-2 mt-3 mb-3" />
{#if isLoading}
  <p>Fetching...</p>
{/if}
{#if !isLoading}
  {#if Object.keys(subpaths).length === 0}
    <ListGroupItem color="dark" class="mx-2 px-3 py-3 text-center"
      >Nothing to display</ListGroupItem
    >
  {/if}
  {#each Object.keys(subpaths) as subpath}
    <ListGroup>
      <ListGroupItem active
        >{subpath} ({subpaths[subpath]?.valid_entries ??
          subpaths[subpath].invalid_entries.length.toString() + " corrupted"} entry)</ListGroupItem
      >
      {#if subpaths[subpath].invalid_entries}
        {#each subpaths[subpath].invalid_entries as entry}
          <ListGroupItem
            href={`/management/dashboard/${
              $params.space_name
            }/${subpath.replaceAll("/", "-")}/${entry}`}
            action>{entry}</ListGroupItem
          >
        {/each}
      {/if}
    </ListGroup>
  {/each}
{/if}
