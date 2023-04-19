<script>
  import Form from "../../_components/Form.svelte";
  import Input from "../../_components/Input.svelte";
  import { _ } from "../../../i18n";
  import { QueryType, ResourceType, get_spaces, query } from "../../../dmart";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  async function handleResponse(event) {
    const { type, space_name, subpath, shortname, search, offset, limit } =
      event.detail;
    const query_request = {
      type,
      space_name,
      subpath,
      shortname,
      search,
      offset,
      limit,
    };
    const response = await query(query_request);
    dispatch("response", response);
  }

  let spaces = [];

  $: {
    async function getSpaces() {
      spaces = (await get_spaces()).records;
    }
    getSpaces();
  }
</script>

<Form title="_________" on:response={handleResponse}>
  <Input id="type" type="select" title={$_("query_type")}>
    {#each Object.keys(QueryType) as queryType}
      <option value={queryType}>{queryType}</option>
    {/each}
  </Input>
  <Input id="space_name" type="select" title={$_("space_name")}>
    {#each spaces as space}
      <option value={space.shortname}>{space.shortname}</option>
    {/each}
  </Input>
  <Input id="subpath" type="text" title={$_("subpath")} value="/" />
  <Input id="search" type="text" title={$_("search")} value="*" />
  <Input id="resource_types" type="select" title={$_("resource_types")}>
    {#each Object.keys(ResourceType) as resourceType}
      <option value={resourceType}>{resourceType}</option>
    {/each}
  </Input>
  <Input id="resource_shortnames" type="text" title={$_("shortnames")} />
  <Input id="limit" type="number" title={$_("limit")} value={"10"} />
  <Input id="offset" type="number" title={$_("offset")} value={"0"} />
</Form>
