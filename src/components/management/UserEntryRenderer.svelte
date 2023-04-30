<script lang="ts">
  import Attachments from "./Attachments.svelte";
  import { onDestroy } from "svelte";
  import {
    ActionResponse,
    QueryType,
    RequestType,
    ResourceType,
    ResponseEntry,
    Status,
    query,
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
    Nav,
    ButtonGroup,
  } from "sveltestrap";
  import Icon from "../Icon.svelte";
  import { _ } from "@/i18n";
  import ListView from "./ListView.svelte";
  import Prism from "../Prism.svelte";
  import {JSONEditor, createAjvValidator, Validator} from "svelte-jsoneditor";
  import { status_line } from "@/stores/management/status_line";
  import { timeAgo } from "@/utils/timeago";
  import { showToast, Level } from "@/utils/toast";
  import { faSave } from "@fortawesome/free-regular-svg-icons";
  import history_cols from "@/stores/management/list_cols_history.json";
  import "bootstrap";

  let header_height: number;
  let validator: Validator = createAjvValidator({ schema: {} });
  export let entry: ResponseEntry;
  console.log({ entry });

  export let space_name: string;
  export let subpath: string;
  export let resource_type: ResourceType;
  export let schema_name: string | undefined = null;

  let tab_option = resource_type === ResourceType.folder ? "list" : "view";
  let content = { json: entry || {}, text: undefined };
  let oldContent = { json: entry || {}, text: undefined };
  let entryContent = { json: {} || {}, text: undefined };

  onDestroy(() => status_line.set(""));
  status_line.set(
    `<small>Last updated: <strong>${timeAgo(
      new Date(entry.updated_at)
    )}</strong><br/>Attachments: <strong>${
      Object.keys(entry.attachments).length
    }</strong></small>`
  );

  let isSchemaValidated: boolean;
  function handleChange(updatedContent, previousContent, patchResult) {
    const v = patchResult?.contentErrors?.validationErrors;
    if (v === undefined || v.length === 0) {
      isSchemaValidated = true;
    } else {
      isSchemaValidated = false;
    }
  }

  let errorContent = null;
  async function handleSave() {
    // if (!isSchemaValidated) {
    //   alert("The content does is not validated agains the schema");
    //   return;
    // }
    errorContent = null;
    const data = content.json ? { ...content.json } : JSON.parse(content.text);
    const response = await request({
      space_name: space_name,
      request_type: RequestType.replace,
      records: [
        {
          resource_type,
          shortname: entry.shortname,
          subpath,
          attributes: data,
        },
      ],
    });
    if (response.status == Status.success) {
      showToast(Level.info);
    } else {
      errorContent = response;
      showToast(Level.warn);
    }
  }

  function handleRenderMenu(items, context) {
    const separator = {
      separator: true,
    };

    const saveButton = {
      onClick: handleSave,
      icon: faSave,
      title: "Save",
    };

    const itemsWithoutSpace = items.slice(0, items.length - 2);
    return itemsWithoutSpace.concat([
      separator,
      saveButton,
      {
        space: true,
      },
    ]);
  }

  function cleanUpSchema(obj) {
    for (let prop in obj) {
      if (prop === "comment") delete obj[prop];
      else if (typeof obj[prop] === "object") cleanUpSchema(obj[prop]);
    }
  }
  let schema = null;
  async function get_schema() {
    if (entry.payload && entry.payload.schema_shortname) {
      const query_schema = {
        space_name,
        type: QueryType.search,
        subpath: "/schema",
        filter_shortnames: [entry.payload.schema_shortname],
        search: "",
        retrieve_json_payload: true,
      };

      const schema_data = await query(query_schema);
      if (schema_data.status == "success" && schema_data.records.length > 0) {
        schema = schema_data.records[0].attributes["payload"].body;
        cleanUpSchema(schema.properties);
        validator = createAjvValidator({ schema });
      } else {
        console.log("Schema loading failed for ", {
          query_schema,
          schema_data,
        });
      }
    } else {
      schema = null;
    }
  }

  let isModalOpen = false;
  let modalFlag = "create";
  let entryType = "folder";
  let contentShortname = "";
  let selectedSchema = "";

  async function handleSubmit(e : Event) {
    e.preventDefault();
    let response : ActionResponse;
    if (entryType === "content") {
      const body = entryContent.json
        ? { ...entryContent.json }
        : JSON.parse(entryContent.text);
      const request_body = {
        space_name,
        request_type: RequestType.create,
        records: [
          {
            resource_type: ResourceType.content,
            shortname: contentShortname === "" ? "auto" : contentShortname,
            subpath,
            attributes: {
              is_active: true,
              payload: {
                content_type: "json",
                schema_shortname: selectedSchema ? selectedSchema : "",
                body,
              },
            },
          },
        ],
      };
      response = await request(request_body);
    } else if (entryType === "folder") {
      const request_body = {
        space_name,
        request_type: RequestType.create,
        records: [
          {
            resource_type: ResourceType.folder,
            shortname: contentShortname === "" ? "auto" : contentShortname,
            subpath,
            attributes: {
              is_active: true,
              payload: {
                content_type: "json",
                schema_shortname: "folder_rendering",
                body: {
                  shortname_title: "Unique ID",
                  content_schema_shortnames: [
                    selectedSchema ? selectedSchema : "",
                  ],
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
    }
    if (response.status === "success") {
      showToast(Level.info);
      contentShortname = "";
      isModalOpen = false;
    } else {
      showToast(Level.warn);
    }
  }
  $: {
    if (
      schema === null &&
      entry &&
      entry.payload &&
      entry.payload.schema_shortname
    ) {
      get_schema();
    }
  }

  async function handleDelete() {
    if (
      confirm(`Are you sure want to delete ${entry.shortname} entry`) === false
    ) {
      return;
    }
    const request_body = {
      space_name,
      request_type: RequestType.delete,
      records: [
        {
          resource_type,
          shortname: entry.shortname,
          subpath,
          branch_name: "master",
          attributes: {},
        },
      ],
    };
    const response = await request(request_body);
    if (response.status === "success") {
      showToast(Level.info);
      history.go(-1);
    } else {
      showToast(Level.warn);
    }
  }

  function beforeUnload(event) {
    event.preventDefault();

    const x = content.json ? { ...content.json } : JSON.parse(content.text);
    const y = oldContent.json
      ? { ...oldContent.json }
      : JSON.parse(oldContent.text);

    if (JSON.stringify(x) !== JSON.stringify(y)) {
      if (
        confirm("You have unsaved changes, do you want to leave ?") === false
      ) {
        event.returnValue = "";
        return false;
      }
    }
  }
  // const user = {
  //   email: user_entry.email,
  //   msisdn: entry.msisdn,
  //   password: "",
  //   is_email_verified: entry.is_email_verified,
  //   is_msisdn_verified: entry.is_msisdn_verified,
  //   force_password_change: entry.force_password_change,
  // };
  // function handleInputChange(e) {
  //   const { name, value, checked } = e.target;
  //   console.log({ name, value, checked });
  //   if(["force_password_change", "is_msisdn_verified", "is_email_verified"].includes(name)){

  //   }
  // }

  async function handleUserSubmit(e) {
    e.preventDefault();
    // if (user.password === "") {
    //   delete user.password;
    // }
    //
    // const response = await request({
    //   space_name: space_name,
    //   request_type: RequestType.update,
    //   records: [
    //     {
    //       resource_type,
    //       shortname: entry.shortname,
    //       subpath,
    //       attributes: user,
    //     },
    //   ],
    // });
    // if (response.status == Status.success) {
    //   showToast(Level.info);
    //   content.json = { ...content.json, ...user };
    //   content = { ...content };
    //   oldContent = { ...content };
    // } else {
    //   errorContent = response;
    //   showToast(Level.warn);
    // }
  }
</script>

<svelte:window on:beforeunload={beforeUnload} />

<Modal
  isOpen={isModalOpen}
  toggle={() => {
    isModalOpen = !isModalOpen;
    contentShortname = "";
  }}
  size={"lg"}
>
  <ModalHeader />
  <Form on:submit={async (e) => await handleSubmit(e)}>
    <ModalBody>
      <FormGroup>
        {#if modalFlag === "create"}
          <Label class="mt-3">Schema</Label>
          <Input bind:value={selectedSchema} type="select">
            <option value={""}>{"None"}</option>
            {#await query( { space_name, type: QueryType.search, subpath: "/schema", search: "", retrieve_json_payload: true, limit: 99 } ) then schemas}
              {#each schemas.records.map((e) => e.shortname) as schema}
                <option value={schema}>{schema}</option>
              {/each}
            {/await}
          </Input>
        {/if}
        {#if entryType === "content" && modalFlag === "create"}
          <Label class="mt-3">Shortname</Label>
          <Input placeholder="Shortname..." bind:value={contentShortname} />
          <hr />

          <Label class="mt-3">Content</Label>
          <JSONEditor bind:content={entryContent} />
          <!-- onChange={handleChange}
                {validator} -->

          <hr />

          <!-- <Label>Schema</Label>
              <ContentJsonEditor
                bind:self={refJsonEditor}
                content={contentSchema}
                readOnly={true}
                mode={Mode.tree}
              /> -->
        {/if}
        {#if entryType === "folder"}
          <Label class="mt-3">Shortname</Label>
          <Input
            placeholder="Shortname..."
            bind:value={contentShortname}
            required
          />
          {#if modalFlag === "update"}
            <Label class="mt-3">Content</Label>
          {/if}
        {/if}
      </FormGroup>
    </ModalBody>
    <ModalFooter>
      <Button
        type="button"
        color="secondary"
        on:click={() => {
          isModalOpen = false;
          contentShortname = "";
        }}>cancel</Button
      >
      <Button type="submit" color="primary">Submit</Button>
    </ModalFooter>
  </Form>
</Modal>

<div bind:clientHeight={header_height} class="pt-3 pb-2 px-2">
  <Nav class="w-100">
    <ButtonGroup size="sm" class="align-items-center">
      <span class="font-monospace"
        ><small
          ><strong>{entry.shortname}</strong>
          ({resource_type}{#if schema_name}&nbsp;: {schema_name}{/if})</small
        ></span
      >
    </ButtonGroup>
    <ButtonGroup size="sm" class="ms-auto align-items-center">
      <span class="ps-2 pe-1"> {$_("views")} </span>
      {#if resource_type === ResourceType.folder}
        <Button
          outline
          color="success"
          size="sm"
          class="justify-content-center text-center py-0 px-1"
          active={"list" == tab_option}
          title={$_("list")}
          on:click={() => (tab_option = "list")}
        >
          <Icon name="card-list" />
        </Button>
      {/if}

      <Button
        outline
        color="success"
        size="sm"
        class="justify-content-center text-center py-0 px-1"
        active={"view" == tab_option}
        title={$_("view")}
        on:click={() => (tab_option = "view")}
      >
        <Icon name="binoculars" />
      </Button>
      <Button
        outline
        color="success"
        size="sm"
        class="justify-content-center text-center py-0 px-1"
        active={"edit" == tab_option}
        title={$_("edit")}
        on:click={() => (tab_option = "edit")}
      >
        <Icon name="pencil" />
      </Button>
      <Button
        outline
        color="success"
        size="sm"
        class="justify-content-center text-center py-0 px-1"
        active={"attachments" == tab_option}
        title={$_("attachments")}
        on:click={() => (tab_option = "attachments")}
      >
        <Icon name="paperclip" />
      </Button>
      <Button
        outline
        color="success"
        size="sm"
        class="justify-content-center text-center py-0 px-1"
        active={"history" == tab_option}
        title={$_("history")}
        on:click={() => (tab_option = "history")}
      >
        <Icon name="clock-history" />
      </Button>
    </ButtonGroup>
    <ButtonGroup size="sm" class="align-items-center">
      <span class="ps-2 pe-1"> {$_("actions")} </span>
      <Button
        outline
        color="success"
        size="sm"
        title={$_("activate")}
        on:click={() => {}}
        class="justify-content-center text-center py-0 px-1"
      >
        <Icon name="file-check" />
      </Button>
      <Button
        outline
        color="success"
        size="sm"
        title={$_("delete")}
        on:click={handleDelete}
        class="justify-content-center text-center py-0 px-1"
      >
        <Icon name="trash" />
      </Button>
    </ButtonGroup>
    {#if resource_type === ResourceType.folder}
      <ButtonGroup>
        <Button
          outline
          color="success"
          size="sm"
          title={$_("create")}
          class="justify-contnet-center text-center py-0 px-1"
          on:click={() => {
            isModalOpen = true;
            entryType = "content";
          }}
          ><Icon name="file-plus" />
        </Button>
        <Button
          outline
          color="success"
          size="sm"
          title={$_("create")}
          class="justify-contnet-center text-center py-0 px-1"
          on:click={() => {
            isModalOpen = true;
            entryType = "folder";
          }}
          ><Icon name="folder-plus" />
        </Button>
      </ButtonGroup>
    {/if}
  </Nav>
</div>
<div
  class="px-1 pb-1 tab-content"
  style="height: calc(100% - {header_height}px); overflow: hidden auto;"
>
  <div class="h-100 tab-pane" class:active={tab_option === "list"}>
    <ListView {space_name} {subpath} />
  </div>
  <div class="h-100 tab-pane" class:active={tab_option === "source"}>
    <!--JSONEditor json={entry} /-->
    <div
      class="px-1 pb-1 h-100"
      style="text-align: left; direction: ltr; overflow: hidden auto;"
    >
      <pre>
          {JSON.stringify(entry, undefined, 1)}
        </pre>
    </div>
  </div>
  <div class="h-100 tab-pane" class:active={tab_option === "view"}>
    <div
      class="px-1 pb-1 h-100"
      style="text-align: left; direction: ltr; overflow: hidden auto;"
    >
      <Prism code={entry} />
    </div>
  </div>
  <div class="h-100 tab-pane" class:active={tab_option === "edit"}>
    <div
      class="px-1 pb-1 h-100"
      style="text-align: left; direction: ltr; overflow: hidden auto;"
    >
      <!-- <Form class="px-5" on:submit={handleUserSubmit}> -->
      <!--   <FormGroup> -->
      <!--     <Label>Email</Label> -->
      <!--     <!-- on:change={handleInputChange} --> -->
      <!--     <Input -->
      <!--       bind:value={user.email} -->
      <!--       class="w-25" -->
      <!--       type="email" -->
      <!--       name="email" -->
      <!--       placeholder="Email..." -->
      <!--     /> -->
      <!--   </FormGroup> -->
      <!--   <FormGroup> -->
      <!--     <Label>MSISDN</Label> -->
      <!--     <Input -->
      <!--       bind:value={user.msisdn} -->
      <!--       class="w-25" -->
      <!--       type="text" -->
      <!--       name="msisdn" -->
      <!--       placeholder="Email..." -->
      <!--     /> -->
      <!--   </FormGroup> -->
      <!--   <FormGroup> -->
      <!--     <Label>Password</Label> -->
      <!--     <Input -->
      <!--       bind:value={user.password} -->
      <!--       class="w-25" -->
      <!--       type="password" -->
      <!--       name="password" -->
      <!--       placeholder="password..." -->
      <!--     /> -->
      <!--   </FormGroup> -->
      <!--   <FormGroup> -->
      <!--     <Input -->
      <!--       name="is_email_verified" -->
      <!--       bind:checked={user.is_email_verified} -->
      <!--       type="checkbox" -->
      <!--       label="Is Email Verified" -->
      <!--     /> -->
      <!--   </FormGroup> -->
      <!--   <FormGroup> -->
      <!--     <Input -->
      <!--       name="is_msisdn_verified" -->
      <!--       bind:checked={user.is_msisdn_verified} -->
      <!--       type="checkbox" -->
      <!--       label="Is MSISDN Verified" -->
      <!--     /> -->
      <!--   </FormGroup> -->
      <!--   <FormGroup> -->
      <!--     <Input -->
      <!--       name="force_password_change" -->
      <!--       bind:checked={user.force_password_change} -->
      <!--       type="checkbox" -->
      <!--       label="Force Password Change" -->
      <!--     /> -->
      <!--   </FormGroup> -->
      <!--   <Button type="submit">Save</Button> -->
      <!-- </Form> -->

      <JSONEditor
        bind:content
        bind:validator
        onChange={handleChange}
        onRenderMenu={handleRenderMenu}
      />
      {#if errorContent}
        <h3 class="mt-3">Error:</h3>
        <Prism bind:code={errorContent} />
      {/if}
    </div>
  </div>
  <div class="h-100 tab-pane" class:active={tab_option === "history"}>
    {#key tab_option}
      <ListView
        {space_name}
        {subpath}
        type={QueryType.history}
        shortname={entry.shortname}
        is_clickable={false}
        columns={history_cols}
      />
    {/key}
    <!--History subpath="{entry.subpath}" shortname="{entry.shortname}" /-->
  </div>
  <div class="h-100 tab-pane" class:active={tab_option === "attachments"}>
    <Attachments
      {space_name}
      {subpath}
      parent_shortname={entry.shortname}
      attachments={Object.values(entry.attachments).pop()}
    />
  </div>
</div>

<style>
  span {
    color: dimgrey;
  }
</style>