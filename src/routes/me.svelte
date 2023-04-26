<script lang="ts">
  import { context } from '@roxi/routify'
  import Node from "./_components/Node.svelte";

  let node = $context.node.parent;

  console.log({node});

</script>


<Node {node} nested={0} />
