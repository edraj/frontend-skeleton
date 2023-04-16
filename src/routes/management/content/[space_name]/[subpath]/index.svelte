<script lang="ts">
  import { params } from "@roxi/routify";
  import { retrieve_entry, ResourceType } from "../../../../../dmart";

  import EntryRenderer from "../../../_components/EntryRenderer.svelte";
  // import Prism from "../../../_components/Prism.svelte";

  let arr = $params.subpath.split('-');
  const parent_subpath = arr.slice(0, arr.length-1).join("/"); 
  const shortname = arr[arr.length-1];

</script>

{#await retrieve_entry(ResourceType.folder, $params.space_name, parent_subpath, shortname, true, true )}
  <h1> You are here ... @{$params.space_name}/{$params.subpath} </h1>
{:then entry}
  <!--Prism code={entry} /-->
  <EntryRenderer {entry} resource_type={ResourceType.folder} />
{/await}

