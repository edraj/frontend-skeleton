<script lang="ts">
  import { params } from "@roxi/routify";
</script>

<h1> You are here ... @{$params.space_name}/{$params.subpath}/{$params.shortname} </h1>
<h2> Resource type {$params.resource_type} ... schema {$params.schema_name} </h2>
