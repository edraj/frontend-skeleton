<script lang="ts">
  import axios from "axios";
  axios.defaults.withCredentials = true;
  import { website } from "../../../../../../../config";
  import { Col, Container, Row, Button, Modal } from "sveltestrap";
  import { params } from "@roxi/routify";
  import { retrieve_entry, ResourceType, ApiResponse } from "../../../../../../../dmart";
  import JsonEditor from "svelte-jsoneditor/components/JSONEditor.svelte";
  import { JSONContent } from "svelte-jsoneditor";
  import Prism from "../../../../../_components/Prism.svelte";

  // enum VerbType {
  //   get = "get",
  //   post = 'post'
  // }

  type Request = {
    verb: string,
    endpoint: string,
    body?: string
  };


  const headers: { [key: string]: string } = {
  "Content-type": "application/json",
  };

  let curl = "";
  function generateCURL(request : Request) {
    return `curl -X ${request.verb} '${website.backend}/${request.endpoint}'` +
           ((request.verb == "post") ? ("\n-H 'Content-Type: application/json'\n" +
           `-d '${JSON.stringify((request_je.get() as JSONContent).json, undefined, 2)}'` ): "");
  }

  let isCurlOpen = false;
  async function toggleCurl() {
    if (!isCurlOpen) {
      const request = await retrieve_request();
      curl = generateCURL(request);
    }
    isCurlOpen = !isCurlOpen;
  }

  async function retrieve_request() : Promise<Request> {
    const data = await retrieve_entry(ResourceType.content, $params.space_name, $params.subpath.replaceAll("-","/"), $params.shortname, true, true)
    if ( data.payload.body as Record<string, any> ) {
      return {
        verb:  data.payload.body["verb"] as string,
        endpoint: data.payload.body["end_point"].replace(/^\//,"").replace(/\/$/,"").replaceAll(/\/+/g, "/"),
        body: data.payload.body["request_body"]
      };
    }
  };

  let request_je : JsonEditor;
  let response_je : JsonEditor;
  async function call_api(request : Request) {
    curl = generateCURL(request);
    if (request.verb === "post") {
      const response = await axios.post<ApiResponse>(`${website.backend}/${request.endpoint}`, JSON.stringify((request_je.get() as JSONContent).json), {headers});
      response_je.set({text: JSON.stringify(response.data)}) 
    } else if (request.verb === "get") {
      const response = await axios.get<ApiResponse>( `${website.backend}/${request.endpoint}`);
      response_je.set({text: JSON.stringify(response.data)}) 
    }
  }
</script>

{#if $params.space_name && $params.subpath && $params.shortname}
  {#await retrieve_request()}
    <!--h6 transition:fade >Loading ... @{$params.space_name}/{$params.subpath}</h6-->
  {:then request }
    <Container>
      <Row class="my-3">
        <Col class="d-flex justify-content-between">
          <Col>
            <p style="margin: 0px"><b>{$params.subpath} / {$params.shortname}</b> - Endpoint: <code>{request.endpoint}</code> Verb: <code>{request.verb}</code>
              <Button on:click={toggleCurl}>Show curl</Button>
              <Button color="success" on:click={async () => (await call_api(request))}>Call</Button>

            </p>
          </Col>
        </Col>
      </Row>
      <Row>
        <Col><b> Request </b><br/><JsonEditor bind:this={request_je} content={{json: request.body || {}}} /></Col>
        <Col><b> Response </b><br/> <JsonEditor bind:this={response_je} content={{text: "{}"}} readOnly={true} /></Col>
      </Row>
    </Container>
  {:catch error}
    <p style="color: red">{error.message}</p>
  {/await}
{:else}
  <h4> We shouldn't be here ... </h4>
  <pre>{JSON.stringify($params)}</pre>
{/if}

<Modal
    body
    header="Curl command"
    isOpen={isCurlOpen}
    toggle={toggleCurl}
    size="lg"
>
  <Prism language="bash" code={curl} />
</Modal>
