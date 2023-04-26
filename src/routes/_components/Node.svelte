<script lang="ts">
    import { isActive } from '@roxi/routify';
    export let node;
    export let nested = 0;
</script>

<ul>
    <!-- iterate over each child of the provided node -->
  {#each node.children as child (child.path)}
    <li>
      <a href={child.path} class:active={$isActive(child.path)}>{child.name}</a>

      <!-- if the node is active and has children, 
      show them by nesting a new instance of this component in itself.
      We could also use the `nested` count to limit the recursive depth. -->
      <small>{child.path} {child.children.length}</small> {#if $isActive(child.path)} <b>I'm active</b> {/if}
      {#if child.children.length}
        <svelte:self node={child} nested={nested + 1} />                
      {/if}
    </li>
  {/each}
</ul>
