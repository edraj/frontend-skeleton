<script lang="ts">
  import { Col, Container, Row } from "sveltestrap";
  import Header from "@/components/Header.svelte";
  import Footer from "@/components/Footer.svelte";
  import Sidebar from "@/components/Sidebar.svelte";
  import { user } from "@/stores/user";
  import Login from "@/components/Login.svelte";
  import { useRegisterSW } from "virtual:pwa-register/svelte";
  import Offline from "@/components/Offline.svelte";

  let window_height: number;
  let header_height: number;
  let footer_height: number;

  let isOffline = false;

  const { offlineReady, needRefresh, updateServiceWorker } = useRegisterSW({
    onRegistered(swr) {
      console.log(isOffline, `SW registered: ${swr}`);
      isOffline = !navigator.onLine;
    },
    onRegisterError(error) {
      console.log("SW registration error", error);
    },
    onOfflineReady() {
      console.log("SW ready for offline");
      setTimeout(() => close(), 5000);
    },
  });
  function close() {
    offlineReady.set(false);
    needRefresh.set(false);
  }
</script>

<svelte:window bind:innerHeight={window_height} />
{#if isOffline}
  <div class="container-fluid d-flex align-items-start py-3 h-100">
    <Offline />
  </div>
{:else if !$user || !$user.signedin}
  <div
    class="container-fluid d-flex align-items-start py-3 h-100"
    id="login-container"
  >
    <Login />
  </div>
{:else}
  <div bind:clientHeight={header_height} class="fixed-top"><Header /></div>
  <Container
    fluid={true}
    class="position-relative p-0 my-0 w-100"
    style="top: {header_height}px; height: {window_height -
      header_height -
      footer_height -
      2}px;"
  >
    <Row class="border border-success h-100 w-100 ms-0 my-0" noGutters>
      <Col sm="2" class="h-100 border border-warning overflow-auto"
        ><Sidebar /></Col
      >
      <Col sm="10" class="h-100 border border-info overflow-auto">
        <slot />
      </Col>
    </Row>
  </Container>
{/if}
<div bind:clientHeight={footer_height} class="fixed-bottom border border-error">
  <Footer />
</div>
