<!-- routify:meta reset -->
<script lang="ts">
  import { Col, Container, Row } from "sveltestrap";
  import { Circle3 } from 'svelte-loading-spinners';
  // import Footer from "../../_components/Footer.svelte";
  import {user} from "../_stores/user";
  import Login from "../_components/Login.svelte";
  // import Notifications from "svelte-notifications";
  import { getSpaces } from "./_stores/spaces";
  import Header from "./_components/Header.svelte";
  // import Sidebar from "./_components/Sidebar.svelte";

  // let init = getSpaces();
</script>

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
    {:then _}
      <Container
        fluid={true}
        class="d-flex flex-column position-relative p-0 my-0 w-100 h-100"
      >
        <Row
          class="align-items-start w-100 ms-0 border border-primary"
          noGutters
        >
          <Col sm="12"><Header /></Col>
        </Row>
        <Row class="w-100 ms-0 my-0 border border-success h-100" noGutters>
          <Col sm="2" class=" border border-warning">*** Sidebar ***</Col>
          <Col sm="10" class="border border-info"><slot /></Col>
        </Row>
      </Container>
    {:catch error}
      <p style="color: red">{error.message}</p>
    {/await}
  {/if}
