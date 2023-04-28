<script lang="ts">
  import { params } from "@roxi/routify";
  import {
    retrieve_entry,
    ResourceType,
  } from "@/dmart";
  import EntryRenderer from "@/components/management/EntryRenderer.svelte";
  import UserEntryRenderer from "@/components/management/UserEntryRenderer.svelte";

  const resource_type: ResourceType = ResourceType[$params.resource_type];

  function componentsGen() {
    if ($params.resource_type === "user") {
      console.log("-----------");

      return UserEntryRenderer;
    } else {
      return EntryRenderer;
    }
  }
</script>

{#if $params.space_name && $params.subpath && $params.shortname}
  {#await retrieve_entry(resource_type, $params.space_name, $params.subpath.replaceAll("-", "/"), $params.shortname, true, true)}
    <h6>Loading ... @{$params.space_name}/{$params.subpath}</h6>
  {:then entry}
    <svelte:component
      this={componentsGen()}
      {entry}
      {resource_type}
      space_name={$params.space_name}
      subpath={$params.subpath?.replaceAll("-", "/")}
      schema_name={$params.schema_name}
    />
  {:catch error}
    <p style="color: red">{error.message}</p>
  {/await}
{:else}
  <h4>We shouldn't be here ...</h4>
  <pre>{JSON.stringify($params)}</pre>
{/if}
