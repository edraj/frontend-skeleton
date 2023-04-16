<script lang="ts">
  import { get_spaces, get_children, ResourceType } from '../../../../dmart';
  import { ListGroupItem } from 'sveltestrap';
  import Icon from '../../../_components/Icon.svelte';
  import {_} from '../../../../i18n';
  import Folder from "../Folder.svelte";
</script>

{#await get_spaces()}
  <h3> Loading spaces list </h3>
{:then spaces_data}
  {#each spaces_data.records as space}
    <ListGroupItem class="px-0">
      <div class="mb-2">
        <Icon name="diagram-3" class="me-1" /> <b>{space.shortname}</b>
      </div>

      {#await get_children(space.shortname, '/', 10, 0, [ResourceType.folder])}
        <h4> Loading {space.shortname} </h4>
      {:then children_data}
        {#each children_data.records as folder}
          <Folder {folder} space_name={space.shortname} parent_subpath="/" />
        {/each}
      {:catch error}
        <p style="color: red">{error.message}</p>
      {/await}

    </ListGroupItem>
  {/each}

  <pre> {JSON.stringify(spaces_data.records.map(x => x.shortname), null, 2)} </pre>
{:catch error}
	<p style="color: red">{error.message}</p>
{/await}
