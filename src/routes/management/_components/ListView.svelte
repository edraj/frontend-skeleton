<script lang="ts">
  import { status_line } from "../_stores/status_line.js";
  import VirtualList from "svelte-tiny-virtual-list";
  import InfiniteLoading from "svelte-infinite-loading";
  import { query, QueryType } from "../../../dmart";
  import { onDestroy } from "svelte";
  import cols from "../_stores/list_cols.json";
  import { Level, showToast } from '../../../utils/toast';
  import { Breadcrumb, BreadcrumbItem } from "sveltestrap";
  import {
    refresh,
    search,
  } from "../_stores/triggers";
  import { active_section } from "../_stores/active_section.js";

  let quickPreview = false;
  let shortname = "";

  let content = {
    json: {},
    text: undefined,
  };

  onDestroy(() => status_line.set(""));
  export let space_name : string;
  export let subpath : string;

  // const base_query = { ...query };


  let total;
  let lastbatch;
  let page = 0;
  let items = [{}];
  let currentItem = {};
  let api_status = "-";
  let records = [];
  let schema_shortname = "";
  let infiniteId = Symbol();

  async function infiniteHandler({ detail: { loaded, complete, error } }) {
      try {
      console.log (space_name);
        const resp = await query({
          type: QueryType.search, 
          space_name: space_name, 
          subpath: subpath, 
          limit: 50, 
          offset: 50 * page, 
          search: $search
        });

        records = [...records, ...resp.records];
        if (resp.status == "success") {
          lastbatch = resp.attributes.returned;
          total = resp.attributes.total;
          if (schema_shortname === "") {
            schema_shortname =
              records[0]?.attributes?.payload?.schema_shortname;
          }
          if (lastbatch) {
            page += 1;
            items = [...items, ...resp.records];
            loaded();
          } else {
            complete();
          }
          api_status = "success";
          status_line.set(
            `Loaded ${items.length - 1} of ${total}.<br/>api: ${api_status}`
          );
        } else {
          console.log("Error with query", resp);
          api_status = resp.error.message || "Unknown error";
          status_line.set(`api: ${api_status}`);
        }
      } catch (e) {
        console.log(e);
      }
  }

  function value(path : string, data, type) {
    if (path.length == 1 && path[0].length > 0 && path[0] in data) {
      if (type == "json") return JSON.stringify(data[path[0]], undefined, 1);
      else return data[path[0]];
    }

    if (path.length > 1 && path[0].length > 0 && path[0] in data) {
      return value(path.slice(1), data[path[0]], type);
    }
    return "not_applicable";
  }


  function refreshList() {
    currentItem = {};
    page = 0;
    records = [];
    items = [{}];
    infiniteId = Symbol();
  }


  let height;


  $: {
    if ($refresh) {
      refreshList();
    }
  }

  $: {
    if (!quickPreview) {
      shortname = "";
    }
  }
</script>

<svelte:window bind:innerHeight={height} />

  <div class="list">
    <VirtualList
      height={height - 105}
      width="auto"
      stickyIndices={[0]}
      itemCount={items.length}
      overscanCount={100}
      itemSize={25}
    >
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <div
        slot="item"
        let:index
        let:style
        style={style.replaceAll("left:0;", "")}
        class="my-row"
        on:click={async () => {
          const record = { ...records[index - 1] };
          if ($active_section === "events") {
            content.json = record;
            quickPreview = true;
            return;
          }
          shortname = record.shortname;
          schema_shortname = record.attributes?.payload?.schema_shortname;
          window.history.replaceState(
            history.state,
            "",
            `/management/content/${space_name}/${record.subpath.replaceAll("/", "-")}/${shortname}/${record.resource_type}/${schema_shortname}`
          );
        }}
        class:current={currentItem == index}
      >
        {#if index == 0}
          {#each Object.keys(cols) as col}
            <div class="my-cell" style="width: {cols[col].width};">
              <strong>{cols[col].title}</strong>
            </div>
          {/each}
        {:else}
          {#each Object.keys(cols) as col}
            <div
              class="my-cell hide-scroll"
              style=" width: {cols[col].width};overflow: auto;"
            >
              {value(cols[col].path.split("."), items[index], cols[col].type)}
            </div>
          {/each}
        {/if}
      </div>
      <div slot="footer">
        <InfiniteLoading on:infinite={infiniteHandler} identifier={infiniteId}>
          <span slot="noResults" />
          <span slot="noMore" />
          <span slot="error" />
        </InfiniteLoading>
      </div>
    </VirtualList>

  </div>


<style>
  /*
  .back-icon {
    margin-top: 8px;
    margin-left: 8px;
  }
  h5 {
    margin-top: 8px;
    margin-left: 8px;
  }*/
  /* hr {
    color: green;
    background-color: blue;
    height: 5px;
    user-select: none;
    margin: 0;
    position: absolute;
    border: solid 1px gray;
  } 
  */
  :global(.virtual-list-wrapper) {
    margin: 0 0px;
    background: #fff;
    border-radius: 2px;
    box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14),
      0 3px 1px -2px rgba(0, 0, 0, 0.2), 0 1px 5px 0 rgba(0, 0, 0, 0.12);
    background: #fafafa;
    font-family: -apple-system, BlinkMacSystemFont, Helvetica, Arial, sans-serif;
    color: #333;
    -webkit-font-smoothing: antialiased;
  }

  .my-row {
    padding: 0 15px;
    border-bottom: 1px solid #eee;
    box-sizing: border-box;
    height: 30px;
    font-weight: 500;
    background: #fff;
    display: flex;
    justify-content: space-between;
    cursor: pointer;
  }

  .my-row:hover {
    background-color: #ddd;
  }

  .current {
    background-color: yellowgreen;
  }

  .my-cell {
    display: inline;
    /*border: 1px solid orange;*/
  }

  /* Hide scrollbar for Chrome, Safari and Opera */
  .hide-scroll::-webkit-scrollbar {
    display: none;
  }

  /* Hide scrollbar for IE, Edge and Firefox */
  .hide-scroll {
    -ms-overflow-style: none; /* IE and Edge */
    scrollbar-width: none; /* Firefox */
  }
</style>
