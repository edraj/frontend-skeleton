<script>
  import JsonSchemaChild from "@/components/management/JsonSchemaChild.svelte";
  import { RequestType, ResourceType, get_spaces, request } from "@/dmart";
  import JsonEditor from "svelte-jsoneditor/components/JSONEditor.svelte";
  import {
    Col,
    Container,
    Row,
    Input,
    Icon,
    FormGroup,
    Button,
    InputGroupText,
    InputGroup,
  } from "sveltestrap";
  let items = [
    {
      id: (+new Date()).toString(),
      name: "root",
      type: "object",
      title: "title",
      description: "",
    },
  ];
  let content = {
    json: {},
    text: undefined,
  };
  function setProperPropsForObjectOfTypeArray(obj) {
    for (let prop in obj) {
      if (typeof obj[prop] === "object") {
        setProperPropsForObjectOfTypeArray(obj[prop]);
        if (obj[prop].type === "array") {
          obj[prop].items.properties = {
            ...obj[prop].properties,
          };
          delete obj[prop].properties;
        }
      }
    }
    return obj;
  }
  function addItemsToArrays(obj) {
    for (let prop in obj) {
      if (typeof obj[prop] === "object") {
        addItemsToArrays(obj[prop]);
        if (obj[prop].type === "array") {
          obj[prop].items = {
            type: "object",
            properties: [],
          };
        }
      }
    }
    return obj;
  }
  let self;
  function handleRefresh() {
    if (self) {
      content.json = setProperPropsForObjectOfTypeArray(
        addItemsToArrays(JSON.parse(JSON.stringify(items)))
      );
      self.set(content);
    }
  }
  let selected_space;
  let schema_shortname;
  function handleSave(e) {
    e.preventDefault();

    const body = content.json ? { ...content.json } : JSON.parse(content.text);

    const request_body = {
      space_name: selected_space,
      request_type: RequestType.create,
      records: [
        {
          resource_type: ResourceType.schema,
          shortname: schema_shortname,
          subpath: "/schema",
          attributes: {
            is_active: true,
            payload: {
              content_type: "json",
              schema_shortname: "meta_schema",
              body,
            },
          },
        },
      ],
    };
    return request(request_body);
  }
</script>

<Row class="d-flex justify-content-center my-3">
  <InputGroup class="w-75">
    <Input id="space_name" type="select" bind:value={selected_space}>
      <option>Select a space</option>
      {#await get_spaces() then spaces}
        {#each spaces.records as space}
          <option value={space.shortname}>{space.shortname}</option>
        {/each}
      {/await}
    </Input>
    <Input bind:value={schema_shortname} placeholder="Shortname..." />
    <Button type="button" on:click={handleSave}>Create</Button>
  </InputGroup>
</Row>
<Row>
  <Col sm={4}>
    <JsonEditor bind:this={self} bind:content />
  </Col>
  <Col sm={8}>
    {#key items}
      {#each items as item}
        <JsonSchemaChild {item} parent={items} refresh={handleRefresh} />
      {/each}
    {/key}
  </Col>
</Row>
