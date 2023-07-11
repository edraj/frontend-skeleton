<script lang="ts">
  import { status_line } from "@/stores/management/status_line.js";
  import {
    Engine,
    functionCreateDatatable,
    Pagination,
    RowsPerPage,
    Search,
    Sort,
  } from "svelte-datatables-net";
  import { query, QueryType } from "@/dmart";
  import { onDestroy } from "svelte";
  import cols from "@/stores/management/list_cols.json";
  import { search } from "@/stores/management/triggers";
  import { active_section } from "@/stores/management/active_section.js";
  import { goto } from "@roxi/routify";
  import { fade } from "svelte/transition";

  let quickPreview = false;

  let content = {
    json: {},
    text: undefined,
  };

  onDestroy(() => status_line.set(""));

  export let space_name: string;
  export let subpath: string;
  export let shortname: string = null;
  export let type: QueryType = QueryType.search;
  export let columns: any = cols;
  export let is_clickable = true;

  let total: number = 0;
  let api_status = "-";
  let objectDatatable = functionCreateDatatable({
    parData: [],
    parSearchableColumns: Object.keys(columns),
    parRowsPerPage: "10",
    parSearchString: "",
    parSortBy: "id",
    parSortOrder: "ascending",
  });

  function value(path: string, data, type) {
    if (path.length == 1 && path[0].length > 0 && path[0] in data) {
      if (type == "json") return JSON.stringify(data[path[0]], undefined, 1);
      else return data[path[0]];
    }

    if (path.length > 1 && path[0].length > 0 && path[0] in data) {
      return value(path.slice(1), data[path[0]], type);
    }
    return "not_applicable";
  }

  let height: number;

  let numberActivePage = 1;
  let propNumberOfPages = 1;
  let numberRowsPerPage = 1;
  function setNumberOfPages() {
    propNumberOfPages = Math.ceil(total / objectDatatable.numberRowsPerPage);
  }

  async function fetchPageRecords(isSetPage = false) {
    const resp = await query({
      filter_shortnames: shortname ? [shortname] : [],
      type,
      space_name: space_name,
      subpath: subpath,
      exact_subpath: true,
      limit: objectDatatable.numberRowsPerPage,
      offset:
        objectDatatable.numberRowsPerPage *
        (objectDatatable.numberActivePage - 1),
      search: $search,
    });
    total = resp.attributes.total;
    if (isSetPage) {
      setNumberOfPages();
    }
    objectDatatable.arrayRawData = resp.records;
    if (resp.status === "success") {
      api_status = "success";
      status_line.set(
        `<small>Loaded: <strong>${objectDatatable.numberRowsPerPage} of ${total}</strong><br/>Api: <strong>${api_status}</strong></small>`
      );
    } else {
      console.log("Error with query", resp);
      api_status = resp.error.message || "Unknown error";
      status_line.set(`api: ${api_status}`);
    }
  }

  async function onListClick(record: any) {
    if (!is_clickable) {
      return;
    }

    if ($active_section.name === "events") {
      content.json = record;
      quickPreview = true;
      return;
    }
    const shortname = record.shortname;
    const schema_shortname = record.attributes?.payload?.schema_shortname;
    let tmp_subpath = record.subpath.replaceAll("/", "-");

    if (record.resource_type === "folder") {
      let _subpath = `${record.subpath}/${record.shortname}`.replace(
        /\/+/g,
        "/"
      );

      // Trim leading or traling '/'
      if (_subpath.length > 0 && subpath[0] === "/")
        _subpath = _subpath.substring(1);
      if (_subpath.length > 0 && _subpath[_subpath.length - 1] === "/")
        _subpath = _subpath.slice(0, -1);

      $goto("/management/content/[space_name]/[subpath]", {
        space_name: space_name,
        subpath: _subpath.replaceAll("/", "-"),
      });
      return;
    }
    if (schema_shortname) {
      $goto(
        "/management/content/[space_name]/[subpath]/[shortname]/[resource_type]/[payload_type]/[schema_name]",
        {
          space_name: space_name,
          subpath: tmp_subpath,
          shortname: shortname,
          resource_type: record.resource_type,
          payload_type: record.attributes?.payload?.content_type,
          schema_name: schema_shortname,
        }
      );
    } else {
      $goto(
        "/management/content/[space_name]/[subpath]/[shortname]/[resource_type]",
        {
          space_name: space_name,
          subpath: tmp_subpath,
          shortname: shortname,
          resource_type: record.resource_type,
        }
      );
    }
  }

  let paginationBottomInfoFrom = 0;
  let paginationBottomInfoTo = 0;
  $: {
    if (objectDatatable.numberRowsPerPage != numberRowsPerPage) {
      numberRowsPerPage = objectDatatable.numberRowsPerPage;
      fetchPageRecords(true);
    }
    if (objectDatatable.numberActivePage != numberActivePage) {
      numberActivePage = objectDatatable.numberActivePage;
      fetchPageRecords();
    }

    paginationBottomInfoFrom =
      objectDatatable.numberRowsPerPage *
        (objectDatatable.numberActivePage - 1) +
      1;
    paginationBottomInfoTo =
      objectDatatable.numberRowsPerPage * objectDatatable.numberActivePage;
    paginationBottomInfoTo =
      paginationBottomInfoTo >= total ? total : paginationBottomInfoTo;
  }
</script>

<svelte:window bind:innerHeight={height} />

<div class="list">
  {#await fetchPageRecords()}
    READING DATA...
  {:then}
    <Engine bind:propDatatable={objectDatatable} />
    <div class="container-sm">
      <div class="mx-3" transition:fade={{ delay: 25 }}>
        <div class="row align-items-center mb-2">
          <div class="col-12 col-md-6 text-md-start text-center mb-1 mb-md-0">
            <div class="d-md-flex align-items-md-center">
              <span class="me-1">Search:</span>
              <Search
                bind:propDatatable={objectDatatable}
                propPlaceholder="Type here..."
                class="form-control form-control-sm"
              />
            </div>
          </div>
          <div class="col-12 col-md-6 text-md-end text-center">
            <RowsPerPage
              bind:propDatatable={objectDatatable}
              class="d-inline form-select form-select-sm w-auto"
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </RowsPerPage>
            <span>RESULTS PER PAGE</span>
          </div>
        </div>
        {#if objectDatatable.arraySearched.length === 0}
          <div class="text-center mt-5">
            <strong>NO RECORDS FOUND.</strong>
          </div>
        {:else}
          <table class="table table-striped table-sm mt-2">
            <thead>
              <tr>
                {#each Object.keys(columns) as col}
                  <th>
                    <Sort bind:propDatatable={objectDatatable} propColumn={col}
                      >{columns[col].title}</Sort
                    >
                  </th>
                {/each}
              </tr>
            </thead>
            <tbody>
              {#each objectDatatable.arrayRawData as row}
                <tr>
                  {#each Object.keys(columns) as col}
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <td
                      style="cursor: pointer;"
                      on:click={() => onListClick(row)}
                    >
                      {value(
                        columns[col].path.split("."),
                        row,
                        columns[col].type
                      )}
                    </td>
                  {/each}
                </tr>
              {/each}
            </tbody>
          </table>
          <div
            class="d-flex justify-content-center justify-content-md-end mb-5"
          >
            {#key propNumberOfPages}
              <div
                class="d-flex justify-content-between align-items-center w-100"
              >
                <p class="p-0 m-0">
                  Showing {paginationBottomInfoFrom} to {paginationBottomInfoTo}
                  of {total} entries
                </p>
                <Pagination
                  bind:propDatatable={objectDatatable}
                  bind:propNumberOfPages
                  propSize="default"
                />
              </div>
            {/key}
          </div>
        {/if}
      </div>
    </div>
  {/await}
</div>

<style>
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
</style>
