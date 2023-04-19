<script>
  import { QueryType } from "../../../../../dmart/index";
  import ListView from "../../../_components/ListView.svelte";
  import { params } from "@roxi/routify";
</script>

<ListView
  type={QueryType.events}
  space_name={$params.space_name}
  subpath={"/"}
/>
