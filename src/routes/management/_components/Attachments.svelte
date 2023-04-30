<script lang="ts">
  import Icon from "../../_components/Icon.svelte";
  import {
    upload_with_payload,
    request,
    get_attachment_url,
    RequestType,
    ResourceType,
    ResourceAttachementType,
  } from "@/dmart";
  import { showToast, Level } from "../../../utils/toast";
  import Media from "./Media.svelte";
  import {
    Button,
    Input,
    Label,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
  } from "sveltestrap";
  import { JSONEditor } from "svelte-jsoneditor";

  export let attachments;
  export let space_name: string;
  export let subpath: string;
  export let parent_shortname: string;

  // exp rt let forceRefresh;
  let shortname = "auto";

  let openViewAttachmentModal = false;
  function toggleViewAttachmentModal() {
    openViewAttachmentModal = !openViewAttachmentModal;
  }

  let openCreateAttachemntModal = false;
  function toggleCreateAttachemntModal() {
    openCreateAttachemntModal = !openCreateAttachemntModal;
  }

  let content = {
    json: {},
    text: undefined,
  };
  function handleView(attachemntTitle) {
    content = {
      json: attachments.filter((e) => e.shortname === attachemntTitle)[0],
      text: undefined,
    };
    openViewAttachmentModal = true;
  }

  function getFileExtension(filename) {
    var ext = /^.+\.([^.]+)$/.exec(filename);
    return ext == null ? "" : ext[1];
  }

  async function handleDelete(item) {
    if (
      confirm(`Are you sure want to delete ${item.shortname} attachment`) ===
      false
    ) {
      return;
    }

    const request_dict = {
      space_name,
      request_type: RequestType.delete,
      records: [
        {
          resource_type: ResourceType.media,
          shortname: item.shortname,
          subpath: `${item.subpath}/${parent_shortname}`,
          attributes: {},
        },
      ],
    };
    const response = await request(request_dict);
    if (response.status === "success") {
      showToast(Level.info);
      attachments = attachments.filter((e) => e.shortname !== item.shortname);
      openCreateAttachemntModal = false;
    } else {
      showToast(Level.warn);
    }
  }

  let payloadFile;
  let resourceType;
  async function upload() {
    const response = await upload_with_payload(
      space_name,
      subpath + "/" + parent_shortname,
      ResourceType[resourceType],
      shortname,
      payloadFile[0]
    );

    if (response.status === "success") {
      showToast(Level.info);
      openCreateAttachemntModal = false;
      location.reload();
    } else {
      showToast(Level.warn);
    }
  }
</script>

<Modal
  isOpen={openCreateAttachemntModal}
  toggle={toggleCreateAttachemntModal}
  size={"lg"}
>
  <ModalHeader>
    <h3>Add attachment</h3>
  </ModalHeader>
  <ModalBody>
    <div class="d-flex flex-column">
      <Label>Attachment shortname</Label>
      <Input accept="image/png, image/jpeg" bind:value={shortname} />
      <Label>Attachement Type</Label>
      <Input type="select" bind:value={resourceType}>
        {#each Object.values(ResourceAttachementType) as type}
          <option value={type}>{type}</option>
        {/each}
      </Input>
      <hr />
      <Label>Payload File</Label>
      <Input
        accept="image/png, image/jpeg"
        bind:files={payloadFile}
        type="file"
      />
    </div>
  </ModalBody>
  <ModalFooter>
    <Button
      type="button"
      color="secondary"
      on:click={() => (openCreateAttachemntModal = false)}>close</Button
    >
    <Button type="button" color="primary" on:click={upload}>Upload</Button>
  </ModalFooter>
</Modal>

<Modal
  isOpen={openViewAttachmentModal}
  toggle={toggleViewAttachmentModal}
  size={"lg"}
>
  <ModalHeader />
  <ModalBody>
    <JSONEditor
      content={{ json: JSON.parse(JSON.stringify(content)) }}
      readOnly={true}
    />
  </ModalBody>
  <ModalFooter>
    <Button
      type="button"
      color="secondary"
      on:click={() => (openViewAttachmentModal = false)}>close</Button
    >
  </ModalFooter>
</Modal>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="d-flex justify-content-end mx-2 flex-row">
  <div on:click={() => (openCreateAttachemntModal = true)}>
    <Icon style="cursor: pointer;" name="plus-square" />
  </div>
</div>

<div class="d-flex justify-content-center flex-column px-5">
  {#if attachments}
    {#each attachments as attachment}
      <hr />
      <div class="col">
        <div class="row mb-2">
          <a
            class="col-11"
            style="font-size: 1.25em;"
            href={get_attachment_url(
              attachment.resource_type,
              space_name,
              subpath,
              parent_shortname,
              attachment.shortname,
              getFileExtension(attachment.attributes?.payload?.body)
            )}
          >
            {attachment.shortname}</a
          >
          <div class="col-1 d-flex justify-content-between">
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <div
              class="mx-1"
              style="cursor: pointer;"
              on:click={async () => await handleDelete(attachment)}
            >
              <Icon name="trash" color="red" />
            </div>
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <div
              class="mx-1"
              style="cursor: pointer;"
              on:click={() => {
                handleView(attachment.shortname);
              }}
            >
              <Icon name="eyeglasses" color="grey" />
            </div>
          </div>
        </div>
        <div class="d-flex col justify-content-center">
          <Media
            content_type={attachment.attributes?.payload?.content_type}
            displayname={attachment.shortname}
            body={attachment.attributes?.payload?.body}
            url={get_attachment_url(
              attachment.resource_type,
              space_name,
              subpath,
              parent_shortname,
              attachment.shortname,
              getFileExtension(attachment.attributes?.payload?.body)
            )}
          />
        </div>
      </div>
      <hr />
    {/each}
  {/if}
</div>
