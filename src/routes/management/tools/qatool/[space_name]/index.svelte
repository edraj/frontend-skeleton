<script lang="ts">
  import { params } from "@roxi/routify";
  import { ListGroup, ListGroupItem } from "sveltestrap";
  import "bootstrap";
  import { get_space_health } from "@/dmart";
</script>

<div class="mx-2 mt-3 mb-3" />
{#await get_space_health($params.space_name)}
  <p>Fetching...</p>
{:then response}
  {#if Object.keys(response.attributes.folders_report).length === 0}
    <ListGroupItem color="dark" class="mx-2 px-3 py-3 text-center"
      >Nothing to display</ListGroupItem
    >
  {/if}
  {#each Object.keys(response.attributes.folders_report) as subpath}
    <ListGroup>
      <ListGroupItem active>
        {subpath} ({response.attributes.folders_report[subpath]
          ?.valid_entries ??
          response.attributes.folders_report[
            subpath
          ].invalid_entries.length.toString() + " corrupted"} entry)</ListGroupItem>
      {#if response.attributes.folders_report[subpath].invalid_entries}
        {#each response.attributes.folders_report[subpath].invalid_entries as entry}
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
{:catch error}
  <p style="color: red">{error.message}</p>
{/await}
