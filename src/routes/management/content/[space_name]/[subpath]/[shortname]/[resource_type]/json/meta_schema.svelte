<script lang="ts">
  import SchemaEntryRenderer from "@/components/management/SchemaEntryRenderer.svelte";
  import { ResourceType, retrieve_entry } from "@/dmart";
  import { params } from "@roxi/routify";
  const resource_type: ResourceType = ResourceType[$params.resource_type];
  console.log($params, resource_type);
</script>

{#await retrieve_entry(resource_type, $params.space_name, $params.subpath.replaceAll("-", "/"), $params.shortname, true, true)}
  <h6>Loading ... @{$params.space_name}/{$params.subpath}</h6>
{:then entry}
  <SchemaEntryRenderer
    {entry}
    space_name={$params.space_name}
    shortname={$params.shortname}
  />
{:catch error}
  <p style="color: red">{error.message}</p>
{/await}
