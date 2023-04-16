<script lang="ts">
  import { params } from "@roxi/routify";
  import { retrieve_entry, ResourceType } from "../../../../../dmart";

  import EntryRenderer from "../../../_components/EntryRenderer.svelte";
  // import Prism from "../../../_components/Prism.svelte";

  let parent_subpath : string;
  let shortname : string;
  $: {
    let arr = $params.subpath.split('-');
    parent_subpath = arr.slice(0, arr.length-1).join("/"); 
    shortname = arr[arr.length-1];
  }

</script>

{#await retrieve_entry(ResourceType.folder, $params.space_name, parent_subpath, shortname, true, true )}
  <h6> Loading ... @{$params.space_name}/{$params.subpath} </h6>
{:then entry}
  <!--Prism code={entry} /-->
  <EntryRenderer {entry} resource_type={ResourceType.folder} space_name={$params.space_name} subpath={$params.subpath.replaceAll("-", "/")} />
{:catch error}
  <p style="color: red">{error.message}</p>
{/await}

