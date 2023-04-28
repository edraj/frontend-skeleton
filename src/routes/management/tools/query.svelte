<script lang="ts">
  import Table from "@/components/management/Table.svelte";
  import { _ } from "@/i18n";
  import { TabPane, TabContent } from "sveltestrap";
  import { Container, Row, Col } from "sveltestrap";
  import QueryForm from "@/components/management/QueryForm.svelte";
  import Prism from "@/components/Prism.svelte";

  let results = { records: [] };
  let rows = [];

  function handleResponse(event: CustomEvent) {
    results = event.detail;
    rows = results.records;
  }

  let cols = {
    shortname: {
      path: "shortname",
      title: $_("shortname"),
      type: "string",
    },
    displayname: {
      path: "attributes.displayname.en",
      title: $_("displayname"),
      type: "string",
    },
    tags: {
      path: "attributes.tags",
      title: $_("tags"),
      type: "string",
    },
    payload: {
      path: "attributes.payload.schema_shortname",
      title: $_("schema_shortname"),
      type: "string",
    },
    is_active: {
      path: "attributes.is_active",
      title: $_("is_active"),
      type: "string",
    },
  };
</script>

<Container class="h-100">
  <Row class="h-100" noGutters>
    <Col sm="2" class="h-100">
      <QueryForm on:response={handleResponse} />
    </Col>
    <Col sm="10" class="h-100 d-flex flex-column">
      <div class="flex-grow-0 overflow-y-auto" style="min-height: 0;">
        <TabContent class="h-100">
          <TabPane class="h-100" tabId="original" tab={$_("raw")} active>
            <Prism bind:code={results} />
          </TabPane>
          <TabPane class="h-100" tabId="tabular" tab={$_("tabular")}>
            <Table bind:cols bind:rows />
          </TabPane>
        </TabContent>
      </div>
    </Col>
  </Row>
</Container>
