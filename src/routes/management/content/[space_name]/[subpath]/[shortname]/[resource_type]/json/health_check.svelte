<script lang="ts">
  import { goto, params } from "@roxi/routify";
  import {
    ListGroup,
    ListGroupItem,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    Button,
  } from "sveltestrap";
  import "bootstrap";
  import {
    // query,
    // QueryRequest,
    // QueryType,

    ResourceType,
    retrieve_entry,
  } from "@/dmart";

  type ModalData = {
    subpath: string;
    shortname: string;
    resource_type: ResourceType;
    uuid: string;
    issues: [];
    exception: string;
  };
  let modalData: ModalData;

  function handleEdit() {
    $goto(
      `/management/content/[space_name]/[subpath]/[shortname]/[resource_type]`,
      {
        validate_schema: "false",
        space_name: $params.space_name,
        subpath: modalData.subpath,
        shortname: modalData.shortname,
        resource_type: modalData.resource_type,
      }
    );
  }
  function handleErrorEntryClick(err_entry: ModalData, extra: any) {
    modalData = { ...err_entry, ...extra };
    open = true;
  }

  let open = false;
</script>

<Modal isOpen={open} toggle={() => open != open}>
  <ModalHeader>{modalData.shortname}</ModalHeader>
  <ModalBody>
    <p><b>uuid:</b> {modalData.uuid}</p>
    <p><b>issues:</b> {modalData.issues}</p>
    <p><b>exception:</b> {modalData.exception}</p>
  </ModalBody>
  <ModalFooter>
    <Button color="secondary" on:click={() => (open = false)}>Close</Button>
    <Button color="primary" on:click={handleEdit}>Edit</Button>
  </ModalFooter>
</Modal>

<div class="mx-2 mt-3 mb-3" />
{#if $params.shortname}
{#key $params.shortname}
  {#await retrieve_entry(ResourceType.content, "management", "health_check/", $params.shortname, true, true)}
    <p>Fetching...</p>
  {:then response}
    <ListGroup>
      {#if response.payload.body["invalid_folders"]}
        <ListGroupItem active>
          {`Invalid folders (${response.payload.body["invalid_folders"].length} invalid entires)`}
        </ListGroupItem>
        {#if response.payload.body["invalid_folders"].length}
          {#each response.payload.body["invalid_folders"] as entry}
            <ListGroupItem>{entry}</ListGroupItem>
          {/each}
        {/if}
      {/if}

      <ListGroupItem active>
        {`Folders report`}
      </ListGroupItem>
      {#if response.payload.body["folders_report"]}
        {#each Object.keys(response.payload.body["folders_report"]) as key_entry}
          <ListGroupItem color={"secondary"}>{key_entry}</ListGroupItem>
          {#if response.payload.body["folders_report"][key_entry].valid_entries}
            <ListGroupItem color={"success"}
              >{`Valid entries ${response.payload.body["folders_report"][key_entry].valid_entries}`}</ListGroupItem
            >
          {/if}
          {#if response.payload.body["folders_report"][key_entry].invalid_entries}
            <ListGroupItem color={"danger"}
              >{`Invalid entries ${response.payload.body["folders_report"][key_entry].invalid_entries.length}`}</ListGroupItem
            >
            {#each response.payload.body["folders_report"][key_entry].invalid_entries as err_entry}
              <ListGroupItem
                on:click={() => {
                  handleErrorEntryClick(err_entry, { subpath: key_entry });
                }}>{err_entry.shortname}</ListGroupItem
              >
            {/each}
          {/if}
        {/each}
      {/if}
      {#if response.payload.body["invalid_meta_folders"]}
        <ListGroupItem active>
          {`Invalid meta folders (${response.payload.body["invalid_meta_folders"].length} invalid entires)`}
        </ListGroupItem>
        {#if response.payload.body["invalid_meta_folders"].length}
          {#each response.payload.body["invalid_meta_folders"] as entry}
            <ListGroupItem>{entry}</ListGroupItem>
          {/each}
        {/if}
      {/if}
    </ListGroup>
  {:catch error}
    <p style="color: red">{error.message}</p>
  {/await}
  {/key}
{/if}
