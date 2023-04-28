<script lang="ts">
  import { QueryType } from "@/dmart";
  import ListView from "@/components/management/ListView.svelte";
  import { params } from "@roxi/routify";
</script>

<ListView
  type={QueryType.events}
  space_name={$params.space_name}
  subpath={"/"}
/>
