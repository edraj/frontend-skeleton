<script lang="ts">
  import { active_section } from "@/stores/management/active_section";
  import Icon from "../Icon.svelte";
  import { _ } from "@/i18n";
  import { status_line } from "@/stores/management/status_line";
  import Spaces from "./sidebar/Spaces.svelte";
  import Profile from "./sidebar/Profile.svelte";
  import Folder from "./Folder.svelte";
  import { isActive } from "@roxi/routify";
  import { RequestType, ResourceType, space } from "@/dmart";
  import SimpleSpaces from "./sidebar/SimpleSpaces.svelte";
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
    ListGroup,
  } from "sveltestrap";
  import { Level, showToast } from "@/utils/toast";
  import spaces from "@/stores/management/spaces";

  const components = {
    spaces: Spaces,
    profile: Profile,
  };

  let head_height: number;
  let foot_height: number;
  const withSpaces = ["events", "qatool"];

  let isSpaceModalOpen = false;
  let space_name_shortname = "";
  async function handleCreateSpace(e) {
    e.preventDefault();

    const request_body = {
      space_name: space_name_shortname,
      request_type: RequestType.create,
      records: [
        {
          resource_type: ResourceType.space,
          subpath: "/",
          shortname: space_name_shortname,
          attributes: {},
        },
      ],
    };
    const response = await space(request_body);
    if (response.status === "success") {
      showToast(Level.info);
      isSpaceModalOpen = false;
      spaces.refresh();
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
      <FormGroup>
        <Label class="mt-3">Space name</Label>
        <Input bind:value={space_name_shortname} type="text" />
      </FormGroup>
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

<div bind:clientHeight={head_height} class="p-2">
  <h5 class="mt-0 mb-2">
    {#if $active_section.icon}<Icon
        name={$active_section.icon}
        class="pe-1"
      />{/if}
    {#if $active_section.name}{$_($active_section.name)}{/if}
  </h5>
  <hr class="w-100 mt-1 mb-0 py-1" />
</div>
<div
  class="no-bullets scroller pe-0 w-100"
  style="height: calc(100% - {head_height +
    foot_height}px); overflow: hidden auto;"
>
    <ListGroup flush class="w-100">
      {#each $active_section.children as child ($active_section.name + child.name)}
        {#if child.type == "component" && child.name in components}
          <svelte:component this={components[child.name]} />
        {:else if child.type == "link"}
          <!--p class="my-0 font-monospace"><small>{JSON.stringify(child, undefined,1)}</small></p-->
          <ListGroupItem
            color="light"
            action
            href={`/management/${$active_section.name}/${child.name}`}
            active={$isActive(
              `/management/${$active_section.name}/${child.name}`
            )}
          >
            {#if child.icon}<Icon name={child.icon} class="pe-1" />{/if}
            {$_(child.name)}
            {#if withSpaces.includes(child.name) && $active_section.name === "tools"}
              <SimpleSpaces />
            {/if}
          </ListGroupItem>
        {:else if child.type == "folder"}
          <ListGroupItem class="px-0">
            {#if child.icon}<Icon name={child.icon} class="pe-1" />{/if}
            {$_(child.name)}
            <Folder
              space_name={child.space_name}
              folder={{
                shortname: child.name,
                subpath: child.subpath,
                resource_type: ResourceType.folder,
                attributes: {},
              }}
            />
          </ListGroupItem>
        {/if}
      {/each}
    </ListGroup>
  <hr class="w-100 mt-1 mb-0 py-1" />
  <Button class="w-100" type="button" outline color="primary" on:click={() => { isSpaceModalOpen = true; }}>Create new space</Button>
</div>
<div class="w-100" bind:clientHeight={foot_height}>
  {#if $status_line}
    <hr class="my-1" />
    {@html $status_line}
  {/if}
</div>
