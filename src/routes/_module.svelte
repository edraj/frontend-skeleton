<script lang="ts">
  import { Col, Container, Row } from "sveltestrap";
  import Header from "@/components/Header.svelte";
  import Footer from "@/components/Footer.svelte";
  import Sidebar from "@/components/Sidebar.svelte";

  let window_height: number;
  let header_height: number;
  let footer_height: number;

</script>

<svelte:window bind:innerHeight={window_height} />

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

<div bind:clientHeight={footer_height} class="fixed-bottom border border-error">
  <Footer />
</div>
