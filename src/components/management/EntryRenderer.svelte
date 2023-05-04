<script lang="ts">
  import Attachments from "./Attachments.svelte";
  import { onDestroy, onMount } from "svelte";
  import {
    QueryType,
    RequestType,
    ResourceType,
    ResponseEntry,
    ActionResponse,
    Status,
    query,
    request,
    retrieve_entry,
    get_payload,
    ContentType,
    upload_with_payload,
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
  import { JSONEditor, Validator, createAjvValidator } from "svelte-jsoneditor";
  import { status_line } from "@/stores/management/status_line";
  import { timeAgo } from "@/utils/timeago";
  import { showToast, Level } from "@/utils/toast";
  import { faSave } from "@fortawesome/free-regular-svg-icons";
  import history_cols from "@/stores/management/list_cols_history.json";
  import refresh_spaces from "@/stores/management/refresh_spaces";
  // import { search } from "../_stores/triggers";
  // import HtmlEditor from "./HtmlEditor.svelte";
  // import MarkdownEditor from "./MarkdownEditor.svelte";

  let header_height: number;
  let validator: Validator = createAjvValidator({ schema: {} });
  export let entry: ResponseEntry;
  export let space_name: string;
  export let subpath: string;
  export let resource_type: ResourceType;
  export let schema_name: string | undefined = null;
  export let refresh = {};

  let tab_option = resource_type === ResourceType.folder ? "list" : "view";
  let content = { json: entry, text: undefined };
  let contentMeta = { json: {}, text: undefined };
  let contentContent = { json: {}, text: undefined };
  let oldContent = { json: {}, text: undefined };
  let entryContent;

  onMount(async () => {
    const cpy = { ...entry };
    contentContent.json = cpy?.payload?.body ?? {};
    contentContent = { ...contentContent };
    delete cpy?.payload?.body;
    contentMeta.json = cpy;
    contentMeta = { ...contentMeta };
  });

  // separating the content by 2 calls
  // onMount(async () => {
  //   contentMeta.json = await retrieve_entry(
  //     resource_type,
  //     space_name,
  //     subpath,
  //     entry.shortname,
  //     false,
  //     false
  //   );
  //   contentContent.json = await get_payload(
  //     resource_type,
  //     space_name,
  //     subpath,
  //     entry.shortname
  //   );
  //   content.json = contentMeta.json;
  //   content.json["patload"]["body"] = contentContent.json;
  // });

  onDestroy(() => status_line.set(""));
  status_line.set(
    `<small>Last updated: <strong>${timeAgo(
      new Date(entry.updated_at)
    )}</strong><br/>Attachments: <strong>${
      Object.keys(entry.attachments).length
    }</strong></small>`
  );

  // let isSchemaValidated: boolean;
  // function handleChange(updatedContent, previousContent, patchResult) {
    // const v = patchResult?.contentErrors?.validationErrors;
    // isSchemaValidated =  (v === undefined || v.length === 0)
  // }

  let errorContent = null;
  async function handleSave() {
    // if (!isSchemaValidated) {
    //   alert("The content does is not validated agains the schema");
    //   return;
    // }
    errorContent = null;

    const x = contentMeta.json
      ? { ...contentMeta.json }
      : JSON.parse(contentMeta.text);
    const y = contentContent.json
      ? { ...contentContent.json }
      : JSON.parse(contentContent.text);

    const data = { ...x };
    if (data.payload) {
      data.payload.body = y;
    }

    if (resource_type === ResourceType.folder) {
      const arr = subpath.split("/");
      arr[arr.length - 1] = "";
      subpath = arr.join("/");
    }
    subpath = subpath == "__root__" || subpath == "" ? "/" : subpath;

    const request_data = {
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
    };

    const response = await request(request_data);
    if (response.status == Status.success) {
      showToast(Level.info);
      oldContent = { ...content };
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

  function cleanUpSchema(obj: Object) {
    for (let prop in obj) {
      if (prop === "comment") delete obj[prop];
      else if (typeof obj[prop] === "object") cleanUpSchema(obj[prop]);
    }
  }
  let schema = null;
  async function get_schema() {
    if (entry.payload && entry.payload.schema_shortname) {
      // const query_schema = {
      //   space_name,
      //   type: QueryType.search,
      //   subpath: "/schema",
      //   filter_shortnames: [entry.payload.schema_shortname],
      //   filter_types: [ResourceType.schema],
      //   search: "",
      //   retrieve_json_payload: true,
      // };
      //
      // const schema_data = await query(query_schema);
      try {
        const schema_data: ResponseEntry = await retrieve_entry(
          ResourceType.schema,
          space_name,
          "/schema",
          entry.payload.schema_shortname,
          true,
          false
        );

        if (schema_data?.payload?.body) {
          //schema = schema_data.records[0].attributes["payload"].body;
          schema = schema_data.payload.body;
          cleanUpSchema(schema.properties);
          validator = createAjvValidator({ schema });
        } else {
          schema = {};
          console.log("Schema loading failed for ", {
            //query_schema,
            entry,
            schema_data,
          });
        }
      } catch (x) {
        console.log("Failed to load schema", x);
        schema = {};
      }
    } else {
      schema = {};
    }
  }

  let isModalOpen = false;
  let modalFlag = "create";
  let entryType = "folder";
  let contentShortname = "";
  let selectedSchema = "";
  let selectedContentType = ContentType.json;
  let new_resource_type: ResourceType = ResourceType.content;
  let payloadFiles: FileList;

  async function handleSubmit(event: Event) {
    event.preventDefault();
    let response: any;
    if (entryType === "content") {
      if (
        ["", "json", "text", "html", "markdown"].includes(selectedContentType)
      ) {
        let body: any;
        if (selectedContentType === "json") {
          body = entryContent.json
            ? { ...entryContent.json }
            : JSON.parse(entryContent.text);
        } else {
          body = entryContent;
        }

        const request_body = {
          space_name,
          request_type: RequestType.create,
          records: [
            {
              resource_type: new_resource_type,
              shortname: contentShortname === "" ? "auto" : contentShortname,
              subpath,
              attributes: {
                is_active: true,
                payload: {
                  content_type: selectedContentType
                    ? selectedContentType
                    : "json",
                  schema_shortname: selectedSchema ? selectedSchema : "",
                  body,
                },
              },
            },
          ],
        };
        response = await request(request_body);
      } else if (
        ["image", "python", "pdf", "audio", "video"].includes(
          selectedContentType
        )
      ) {
        response = await upload_with_payload(
          space_name,
          subpath,
          ResourceType[new_resource_type],
          contentShortname === "" ? "auto" : contentShortname,
          payloadFiles[0]
        );
      }
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
      refresh = !refresh;
    } else {
      showToast(Level.warn);
    }
  }
  $: {
    if (schema === null && entry?.payload?.schema_shortname) {
      get_schema();
    }
  }

  async function handleDelete() {
    if (
      confirm(`Are you sure want to delete ${entry.shortname} entry`) === false
    ) {
      return;
    }

    const arr = subpath.split("/");
    arr[arr.length - 1] = "";
    const parentSubpath = arr.join("/");
    const request_body = {
      space_name,
      request_type: RequestType.delete,
      records: [
        {
          resource_type,
          shortname: entry.shortname,
          subpath: parentSubpath || "/",
          branch_name: "master",
          attributes: {},
        },
      ],
    };
    const response = await request(request_body);
    if (response.status === "success") {
      showToast(Level.info);
      // await spaces.refresh();
      refresh_spaces.refresh();
      history.go(-1);
    } else {
      showToast(Level.warn);
    }
  }

  function beforeUnload(event: Event) {
    event.preventDefault();

    const x = content.json ? { ...content.json } : JSON.parse(content.text);
    const y = oldContent.json
      ? { ...oldContent.json }
      : JSON.parse(oldContent.text);

    if (JSON.stringify(x) !== JSON.stringify(y)) {
      if (
        confirm("You have unsaved changes, do you want to leave ?") === false
      ) {
        // Deprecated event.returnValue = false;
        return false;
      }
    }
  }

  function hasChanged() {
    // let _has_changed =
    //   data && data.attributes && data.attributes.payload && !(content === data.attributes.payload.embedded);
    // //console.log("Entry", $active_entry);
    // //console.log("hasChanged called: ", _has_changed, $has_changed);
    // //console.log("content vs embedded", content, "|", $active_entry.data.attributes.payload.embedded);
    // if (_has_changed != $has_changed) {
    //   $has_changed = _has_changed;
    //   //console.log("Has *actually* changed: ", $has_changed);
    // }
  }

  $: {
    if (selectedContentType === "json") {
      entryContent = { json: {} || {}, text: undefined };
    } else {
      entryContent = "";
    }
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
        <h4>
          Creating an entry under <span class="text-success">{space_name}</span
          >/<span class="text-primary">{subpath}</span>
        </h4>
        {#if modalFlag === "create"}
          <Label class="mt-3">Resource type</Label>
          <Input bind:value={new_resource_type} type="select">
            {#each Object.values(ResourceType) as type}
              <option value={type}>{type}</option>
            {/each}
          </Input>
          <Label class="mt-3">Content type</Label>
          <Input bind:value={selectedContentType} type="select">
            <option value={""}>{"None"}</option>
            {#each Object.values(ContentType) as type}
              <option value={type}>{type}</option>
            {/each}
          </Input>
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

          {#if selectedContentType}
            <Label class="mt-3">Content</Label>
            {#if ["image", "python", "pdf", "audio", "video"].includes(selectedContentType)}
              <Input
                accept="image/png, image/jpeg"
                bind:files={payloadFiles}
                type="file"
              />
            {/if}
            {#if selectedContentType === "json"}
              <JSONEditor bind:content={entryContent} />
              <!-- onChange={handleChange}
                {validator} -->
            {/if}
            {#if selectedContentType === "text"}
              <Input type="textarea" bind:value={entryContent} />
            {/if}
            {#if selectedContentType === "html"}
              <Input type="textarea" bind:value={entryContent} />
              <!-- <HtmlEditor bind:content={entryContent} on:changed={hasChanged} /> -->
            {/if}
            {#if selectedContentType === "markdown"}
              <Input type="textarea" bind:value={entryContent} />
              <!-- <MarkdownEditor
              bind:content={entryContent}
              on:changed={hasChanged}
            /> -->
            {/if}
          {/if}
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
        ><small>
          <span class="text-success">{space_name}</span>/<span
            class="text-primary">{subpath}</span
          >/<strong>{entry.shortname}</strong>
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
        active={"edit_meta" == tab_option}
        title={$_("edit") + " meta"}
        on:click={() => (tab_option = "edit_meta")}
      >
        <Icon name="code-slash" />
      </Button>
      {#if entry.payload}
        <Button
          outline
          color="success"
          size="sm"
          class="justify-content-center text-center py-0 px-1"
          active={"edit_content" == tab_option}
          title={$_("edit") + " payload"}
          on:click={() => (tab_option = "edit_content")}
        >
          <Icon name="pencil" />
        </Button>
      {/if}
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
  <div class="h-100 tab-pane" class:active={tab_option === "edit_meta"}>
    <div
      class="px-1 pb-1 h-100"
      style="text-align: left; direction: ltr; overflow: hidden auto;"
    >
      <JSONEditor bind:content={contentMeta} onRenderMenu={handleRenderMenu} />
      {#if errorContent}
        <h3 class="mt-3">Error:</h3>
        <Prism bind:code={errorContent} />
      {/if}
    </div>
  </div>
  {#if entry.payload}
    <div class="h-100 tab-pane" class:active={tab_option === "edit_content"}>
      <div
        class="px-1 pb-1 h-100"
        style="text-align: left; direction: ltr; overflow: hidden auto;"
      >
          <!-- onChange={handleChange} -->
        <JSONEditor
          bind:content={contentContent}
          bind:validator
          onRenderMenu={handleRenderMenu}
        />
        {#if errorContent}
          <h3 class="mt-3">Error:</h3>
          <Prism bind:code={errorContent} />
        {/if}
      </div>
    </div>
  {/if}

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
