<!-- routify:meta reset -->

<!--script context="module" lang="ts">
    export const load = _ => {
        return {
            redirect: '/login'
        }
    }
</script-->

<script lang="ts">
  import { Col, Container, Row } from "sveltestrap";
  import { user } from "../_stores/user";
  import Login from "../_components/Login.svelte";
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
  <div bind:clientHeight={header_height} class="fixed-top"><Header /></div>
  <Container
    fluid={true}
    class="position-relative p-0"
    style="top: {header_height}px; height: {window_height -
      header_height -
      8}px;"
  >
    <Row class="h-100" noGutters>
      <Col sm="2" class="h-100 border-end border-light px-1"><Sidebar /></Col>
      <Col sm="10" class="h-100 border-end border-light px-1 overflow-auto"
        ><slot />
      </Col>
    </Row>
  </Container>
{/if}
