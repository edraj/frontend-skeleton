<script context="module" lang="ts">
  export function transformToProperBodyRequest(obj) {
    delete obj.id;
    if (typeof obj !== "object" || obj === null) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(transformToProperBodyRequest);
    }

    for (const key in obj) {
      if (key !== "id") {
        obj[key] = transformToProperBodyRequest(obj[key]);
      }
      if (key === "properties") {
        obj.properties = convertArrayToObject(obj.properties);
      }
    }

    return obj;
  }

  function convertArrayToObject(arr) {
    if (!Array.isArray(arr)) {
      return arr;
    }
    const obj = {};

    for (const item of arr) {
      const key = item["name"];
      delete item.name;
      obj[key] = item;
    }
    return obj;
  }
</script>

<script lang="ts">
  import { Col, Row } from "sveltestrap";
  import JsonSchemaChild from "./JsonSchemaChild.svelte";
  import { JSONEditor } from "svelte-jsoneditor";

  export let content;
  export let items;

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
</script>

<Row style="display: flex;justify-content: center;width: 100%;">
  <Col sm={4}>
    <JSONEditor bind:this={self} bind:content readOnly={true} />
  </Col>
  <Col sm={6}>
    {#key items}
      {#each items as item}
        <JsonSchemaChild {item} parent={items} refresh={handleRefresh} />
      {/each}
    {/key}
  </Col>
</Row>
