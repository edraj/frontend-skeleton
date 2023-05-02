<script lang="ts">
  import { get_spaces } from "@/dmart";
  import { ListGroupItem } from "sveltestrap";
  import Icon from "../../Icon.svelte";
  import { _ } from "@/i18n";
  import { goto } from "@roxi/routify";
  // import { fade } from 'svelte/transition';
  export let name;

  // let expanded: string;

  function handleClick(e, space) {
    e.preventDefault();
    $goto(`/management/tools/${name}/[space_name]`, {
      space_name: space.shortname,
    });
  }
</script>

{#await get_spaces()}
  <!--h3 transition:fade >Loading spaces list</h3-->
{:then spaces_data}
  {#each spaces_data.records as space}
    <ListGroupItem class="ps-2 pe-0 py-0">
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <div
        class="mb-2"
        style="cursor: pointer;"
        on:click={(e) => {
          handleClick(e, space);
        }}
      >
        <Icon name="diagram-3" class="me-1" /> <b>{space.shortname}</b>
      </div>
    </ListGroupItem>
  {/each}
{:catch error}
  <p style="color: red">{error.message}</p>
{/await}
