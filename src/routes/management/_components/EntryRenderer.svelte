<script lang="ts">
  // import History from "./History.svelte";
  // import Attachments from "../../_components/Attachments.svelte";
  import {ResourceType, ResponseEntry} from "../../../dmart";
  import { Nav, Button, ButtonGroup } from "sveltestrap";
  import Icon from "../../_components/Icon.svelte";
  import { _ } from "../../../i18n";
  import ListView from "./ListView.svelte";

  let header_height : number;
  // let status : string;
  export let entry : ResponseEntry;
  export let space_name : string;
  export let subpath : string;
  export let resource_type : ResourceType;
  export let schema_name : string | undefined;

  let tab_option = (resource_type === ResourceType.folder) ? "list" : "edit" ;

</script>
<div bind:clientHeight="{header_height}">
  <Nav class="w-100">
    <ButtonGroup size="sm" class="align-items-center">
      <span class="font-monospace"><small>{entry.shortname} ({resource_type} {#if schema_name}{schema_name}{/if})</small></span>
    </ButtonGroup>
    <ButtonGroup size="sm" class="ms-auto align-items-center">
      <span class="ps-2 pe-1"> {$_("views")} </span>
      {#if resource_type === ResourceType.folder}
        <Button
          outline
          color="success"
          size="sm"
          class="justify-content-center text-center py-0 px-1"
          active="{'list' == tab_option}"
          title="{$_('list')}"
          on:click="{() => (tab_option = 'list')}"
        >
          <Icon name="info" />
        </Button>
      {/if}

      <Button
        outline
        color="success"
        size="sm"
        class="justify-content-center text-center py-0 px-1"
        active="{'edit' == tab_option}"
        title="{$_('edit')}"
        on:click="{() => (tab_option = 'edit')}">
        <Icon name="pencil" />
      </Button>
      <Button
        outline
        color="success"
        size="sm"
        class="justify-content-center text-center py-0 px-1"
        active="{'source' == tab_option}"
        title="{$_('source')}"
        on:click="{() => (tab_option = 'source')}">
        <Icon name="code-slash" />
      </Button>
      <!--Button
        outline
        color="success"
        size="sm"
        class="justify-content-center text-center py-0 px-1"
        active="{'details' == tab_option}"
        title="{$_('details')}"
        on:click="{() => (tab_option = 'details')}"
      >
        <Icon name="info" />
      </Button-->
      <Button
        outline
        color="success"
        size="sm"
        class="justify-content-center text-center py-0 px-1"
        active="{'attachments' == tab_option}"
        title="{$_('attachments')}"
        on:click="{() => (tab_option = 'attachments')}">
        <Icon name="paperclip" />
      </Button>
      <Button
        outline
        color="success"
        size="sm"
        class="justify-content-center text-center py-0 px-1"
        active="{'history' == tab_option}"
        title="{$_('history')}"
        on:click="{() => (tab_option = 'history')}">
        <Icon name="clock-history" />
      </Button>
    </ButtonGroup>
    <ButtonGroup size="sm" class="align-items-center">
      <span class="ps-2 pe-1"> {$_("actions")} </span>
      <Button
        outline
        color="success"
        size="sm"
        title={$_('activate')}
        on:click={() => {}}
        class="justify-content-center text-center py-0 px-1"
      >
        <Icon name="file-check" />
      </Button>
      <Button
        outline
        color="success"
        size="sm"
        title={$_('delete')}
        on:click={() => {}}
        class="justify-content-center text-center py-0 px-1"
      >
        <Icon name="trash" />
      </Button>
    </ButtonGroup>
    <!--ButtonGroup size="sm" class="align-items-center">
      <span class="ps-2 pe-1"> {$_("status")} </span>
      <Button
        outline
        color='secondary'
        title="{$_('save')}"
        size="sm"
        disabled="{true}"
        class="justify-content-center text-center py-0 px-1 me-1">
        <span class="font-monospace text-success"><small>{@html status}</small></span>
      </Button>
      <Button
        outline
        color='secondary'
        title="{$_('save')}"
        size="sm"
        class="justify-content-center text-center py-0 px-1">
        <Icon name="cloud-upload" />
      </Button>
    </ButtonGroup-->
    {#if resource_type === ResourceType.folder}
      <ButtonGroup>
        <Button
          outline
          color="success"
          size="sm"
          title="{$_('create')}"
          class="justify-contnet-center text-center py-0 px-1"
          on:click={() => { }}><Icon name="file-plus" 
          />
        </Button>
        <Button
          outline
          color="success"
          size="sm"
          title="{$_('create')}"
          class="justify-contnet-center text-center py-0 px-1"
          on:click={() => { }}><Icon name="folder-plus" 
          />
        </Button>
      </ButtonGroup>
    {/if}
  </Nav>
</div>
<div class="px-1 pb-1 tab-content" style="height: calc(100% - {header_height}px); overflow: hidden auto;">
  <div class="h-100 tab-pane" class:active="{tab_option === 'list'}">
    <ListView {space_name} {subpath}/>
  </div>
  <div class="h-100 tab-pane" class:active="{tab_option === 'source'}">
    <!--JSONEditor json={entry} /-->
    <div class="px-1 pb-1 h-100" style="text-align: left; direction: ltr; overflow: hidden auto;">
      <pre>
        {JSON.stringify(entry, undefined, 1)}
      </pre>
    </div>
  </div>
  <div class="h-100 tab-pane" class:active="{tab_option === 'edit'}">
    <div class="px-1 pb-1 h-100" style="text-align: left; direction: ltr; overflow: hidden auto;">
      <pre> {JSON.stringify(entry,null,1)} </pre>
    </div>
  </div>
  <div class="h-100 tab-pane" class:active="{tab_option === 'history'}">
    <pre> History goes here </pre>
    <!--History subpath="{entry.subpath}" shortname="{entry.shortname}" /-->
  </div>
  <div class="h-100 tab-pane" class:active="{tab_option === 'attachments'}">
    <pre> Attachments go here </pre>
    <!--Attachments entry="{entry}" extended="{true}" /-->
  </div>
</div>

<style>
  span {
    color: dimgrey;
  }
</style>
