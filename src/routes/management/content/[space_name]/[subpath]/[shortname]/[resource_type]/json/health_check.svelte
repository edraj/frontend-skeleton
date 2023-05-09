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
    query,
    QueryRequest,
    QueryType,
    ResourceType,
    retrieve_entry,
  } from "@/dmart";

  let modalData = {};
  function handleEdit() {
    $goto(
      "/management/content/[space_name]/[subpath]/[shortname]/[resource_type]",
      {
        space_name: $params.space_name,
        subpath: modalData.subpath,
        shortname: modalData.shortname,
        resource_type: modalData.resource_type,
      }
    );
  }
  function handleErrorEntryClick(err_entry, extra) {
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
{#await retrieve_entry(ResourceType.content, "management", "health_check/", $params.space_name, true, true)}
  <p>Fetching...</p>
{:then response}
  <!-- {#if Object.keys(response.attributes.folders_report).length === 0}
      <ListGroupItem color="dark" class="mx-2 px-3 py-3 text-center"
        >Nothing to display</ListGroupItem
      >
    {/if} -->
  <ListGroup>
    <ListGroupItem active>
      {`Invalid folders (${response.payload.body.health.invalid_folders.length} invalid entires)`}
    </ListGroupItem>
    {#if response.payload.body.health.invalid_folders.length}
      {#each response.payload.body.health.invalid_folders as entry}
        <ListGroupItem>{entry}</ListGroupItem>
      {/each}
    {/if}
    <ListGroupItem active>
      {`Folders report`}
    </ListGroupItem>
    {#each Object.keys(response.payload.body.health.folders_report) as key_entry}
      <ListGroupItem color={"secondary"}>{key_entry}</ListGroupItem>
      <!-- {#each response.payload.body.health.folders_report[key_entry] as entry} -->
      {#if response.payload.body.health.folders_report[key_entry].valid_entries}
        <ListGroupItem color={"success"}
          >{`Valid entries ${response.payload.body.health.folders_report[key_entry].valid_entries}`}</ListGroupItem
        >
      {/if}
      {#if response.payload.body.health.folders_report[key_entry].invalid_entries}
        <ListGroupItem color={"danger"}
          >{`Invalid entries ${response.payload.body.health.folders_report[key_entry].invalid_entries.length}`}</ListGroupItem
        >
        {#each response.payload.body.health.folders_report[key_entry].invalid_entries as err_entry}
          <ListGroupItem
            on:click={() => {
              handleErrorEntryClick(err_entry, { subpath: key_entry });
            }}>{err_entry.shortname}</ListGroupItem
          >
        {/each}
      {/if}
      <!-- {/each} -->
    {/each}
    <ListGroupItem active>
      {`Invalid meta folders (${response.payload.body.health.invalid_meta_folders.length} invalid entires)`}
    </ListGroupItem>
    {#if response.payload.body.health.invalid_meta_folders.length}
      {#each response.payload.body.health.invalid_meta_folders as entry}
        <ListGroupItem>{entry}</ListGroupItem>
      {/each}
    {/if}
  </ListGroup>

  <!-- {#each Object.keys(response.payload.body.health) as subpath}
      <ListGroup>
        <ListGroupItem active>
          {subpath} ({response.attributes.folders_report[subpath]
            ?.valid_entries ??
            response.attributes.folders_report[
              subpath
            ].invalid_entries.length.toString() + " corrupted"} entry)</ListGroupItem
        >
        {#if response.attributes.folders_report[subpath].invalid_entries}
          {#each response.attributes.folders_report[subpath].invalid_entries as entry}
            <ListGroupItem
              href={`/management/dashboard/${
                $params.space_name
              }/${subpath.replaceAll("/", "-")}/${entry}`}
              action>{entry}</ListGroupItem
            >
          {/each}
        {/if}
      </ListGroup>
    {/each} -->
{:catch error}
  <p style="color: red">{error.message}</p>
{/await}
