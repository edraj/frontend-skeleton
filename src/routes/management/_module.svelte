<!-- routify:meta reset -->
<script lang="ts">
  import { Col, Container, Row } from "sveltestrap";
  import { Circle3 } from 'svelte-loading-spinners';
  import { retrieve_entry, ResourceType } from '../../dmart';
  import {user} from "../_stores/user";
  import Login from "../_components/Login.svelte";
  // import Notifications from "svelte-notifications";
  import { getSpaces } from "./_stores/spaces";
  import Header from "./_components/Header.svelte";
  import Sidebar from "./_components/Sidebar.svelte";

  let window_height: number;
  let header_height: number;

</script>

  <svelte:window bind:innerHeight={window_height} />

  {#if !$user || !$user.signedin}
    <div
      class="container-fluid d-flex align-items-start py-3"
      id="login-container"
    >
      <Login />
    </div>
  {:else}
    {#await getSpaces()}
      <div class="w-100 h-100 border border-success d-flex justify-content-center align-items-center">
        <Circle3 size="75" unit="px" duration="1s" />
      </div>
    {:then spaces}
      <div bind:clientHeight="{header_height}" class="fixed-top"><Header /></div>
      <Container
        fluid={true}
        class="position-relative p-0"
        style="top: {header_height}px; height: {window_height - header_height - 8}px;"
      >
        <Row class="h-100" noGutters>
          <Col sm="2" class="h-100 border-end border-light px-1"><Sidebar /></Col>
          <Col sm="10" class="h-100 border-end border-light px-1 overflow-auto"><slot /> 
          <!--this is a slot <pre>{@html JSON.stringify(spaces, null, 2)} </pre>-->

        </Col>
        </Row>
      </Container>
    {:catch error}
      <p style="color: red">{error.message}</p>
    {/await}
  {/if}

