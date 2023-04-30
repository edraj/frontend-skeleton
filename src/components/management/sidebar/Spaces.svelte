<script lang="ts">
  import {
    get_spaces,
    get_children,
    RequestType,
    ResourceType,
    request,
  } from "@/dmart";
  import {
    Form,
    FormGroup,
    Button,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    Label,
    Input,
    ListGroupItem,
  } from "sveltestrap";
  import Icon from "../../Icon.svelte";
  import { _ } from "@/i18n";
  import Folder from "../Folder.svelte";
  import { Level, showToast } from "@/utils/toast";
  import { JSONEditor } from "svelte-jsoneditor";

  let expanded: string;
  function displayname(space_name): string {
    const lang = JSON.parse(localStorage.getItem("preferred_locale"));
    if (space_name?.attributes?.displayname) {
      return space_name?.attributes?.displayname[lang];
    } else {
      return space_name.shortname;
    }
  }

  let isSpaceModalOpen = false;
  let modeFlag = "create";
  let selected_space_name;
  let subpath_shortname;
  let content = { json: {}, text: undefined };
  async function handleCreateSpace(e: any) {
    e.preventDefault();
    let response;
    if (modeFlag === "create") {
      const request_body = {
        space_name: selected_space_name,
        request_type: RequestType.create,
        records: [
          {
            resource_type: ResourceType.folder,
            subpath: "/",
            shortname: subpath_shortname,
            attributes: {
              is_active: true,
              payload: {
                content_type: "json",
                schema_shortname: "folder_rendering",
                body: {
                  shortname_title: "Unique ID",
                  content_schema_shortnames: [],
                  index_attributes: [
                    {
                      key: "shortname",
                      name: "Unique ID",
                    },
                    {
                      key: "created_at",
                      name: "Created At",
                    },
                    {
                      key: "owner_shortname",
                      name: "Created By",
                    },
                  ],
                  allow_create: true,
                  allow_update: true,
                  allow_delete: true,
                  use_media: true,
                  expand_children: false,
                  content_resource_types: ["content"],
                  allow_upload_csv: true,
                  allow_csv: true,
                  filter: [],
                },
              },
            },
          },
        ],
      };
      response = await request(request_body);
    } else if (modeFlag === "update") {
      const data = content.json
        ? { ...content.json }
        : JSON.parse(content.text);
      const request_body = {
        space_name: selected_space_name,
        request_type: RequestType.update,
        records: [data],
      };
      response = await request(request_body);
    }

    if (response.status === "success") {
      showToast(Level.info);
      location.reload();
    } else {
      showToast(Level.warn);
    }
  }
</script>

<Modal
  isOpen={isSpaceModalOpen}
  toggle={() => {
    isSpaceModalOpen = !isSpaceModalOpen;
  }}
  size={"lg"}
>
  <ModalHeader />
  <Form on:submit={(e) => handleCreateSpace(e)}>
    <ModalBody>
      {#if modeFlag === "create"}
        <FormGroup>
          <Label class="mt-3">Subpath Shortname</Label>
          <Input bind:value={subpath_shortname} type="text" />
        </FormGroup>
      {/if}
      {#if modeFlag === "update"}
        <JSONEditor bind:content />
      {/if}
    </ModalBody>
    <ModalFooter>
      <Button
        type="button"
        color="secondary"
        on:click={() => (isSpaceModalOpen = false)}>cancel</Button
      >
      <Button type="submit" color="primary">Submit</Button>
    </ModalFooter>
  </Form>
</Modal>

{#await get_spaces()}
  <!--h3 transition:fade >Loading spaces list</h3-->
{:then spaces_data}
  {#each spaces_data.records as space}
    <ListGroupItem class="ps-2 pe-0 py-0">
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <div
        class="mb-2"
        style="cursor: pointer;"
        on:click={() => (expanded = space.shortname)}
      >
        <Icon name="diagram-3" class="me-1" /> <b>{displayname(space)}</b>
        <span class="toolbar top-0 end-0 position-absolute px-0">
          <span
            class="px-0"
            title={$_("edit")}
            on:click|stopPropagation={() => {
              selected_space_name = space.shortname;
              isSpaceModalOpen = true;
              modeFlag = "create";
            }}
          >
            <Icon name="plus-lg" />
          </span>
          <span
            class="px-0"
            title={$_("edit")}
            on:click|stopPropagation={() => {
              selected_space_name = space.shortname;
              isSpaceModalOpen = true;
              modeFlag = "update";
              content.json = space;
            }}
          >
            <Icon name="pencil" />
          </span>
        </span>
        <style>
          .toolbar {
            /* display: none; */
            color: brown;
          }

          .toolbar span:hover {
            color: green;
          }
        </style>
      </div>

      {#if expanded === space.shortname}
        {#await get_children( space.shortname, "/", 10, 0, [ResourceType.folder] )}
          <!--h4> Loading {space.shortname} </h4-->
        {:then children_data}
          {#each children_data.records as folder}
            <Folder {folder} space_name={space.shortname} />
          {/each}
        {:catch error}
          <p style="color: red">{error.message}</p>
        {/await}
      {/if}
    </ListGroupItem>
  {/each}
{:catch error}
  <p style="color: red">{error.message}</p>
{/await}
