<script>
  import { goto } from "@roxi/routify";
  import { onMount } from "svelte";
  import { ButtonGroup } from "sveltestrap";

  export let space_name;
  export let subpath;
  export let shortname;
  export let resource_type;
  export let schema_name;

  let items = [];
  onMount(() => {
    const parts = subpath.split("/");

    items = parts.map((part, index) => ({
      text: `/${part}`,
      action: () =>
        $goto("/management/content/[space_name]/[subpath]", {
          space_name: space_name,
          subpath: parts
            .slice(0, index + 1)
            .join("/")
            .replaceAll("/", "-"),
        }),
    }));
  });
</script>

<ButtonGroup size="sm" class="align-items-center">
  <span class="font-monospace">
    <small>
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <span
        class="text-success"
        style="cursor: pointer;"
        on:click={() => {
          $goto("/management/content/[space_name]", {
            space_name: space_name,
          });
        }}>{space_name}</span
      >
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      {#each items as item (item.text)}
        <span
          class="text-primary"
          style="cursor: pointer;"
          on:click={item.action}>{item.text}</span
        >
      {/each}
      : <strong>{shortname}</strong>
      ({resource_type}{#if schema_name}&nbsp;: {schema_name}{/if})
    </small>
  </span>
</ButtonGroup>
