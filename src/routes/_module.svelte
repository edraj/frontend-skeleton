<script lang="ts">
  import { meta } from "@roxi/routify";
  import { Col, Container, Row } from "sveltestrap";
  import Header from "./_components/Header.svelte";
  import Footer from "./_components/Footer.svelte";
  // $goto("/management/dashboard");

  let window_height: number;
  let header_height: number;

</script>

<svelte:window bind:innerHeight={window_height} />

<div bind:clientHeight="{header_height}" class="fixed-top"><Header /></div>
<Container
  fluid={true}
  class="position-relative p-0 my-0 w-100"
  style="top: {header_height}px; height: {window_height - header_height - 8}px;"
>
  <Row class="border border-success h-100 w-100 ms-0 my-0" noGutters>
    <Col sm="2" class="h-100 border border-warning">-- Sidebar --</Col>
    <Col sm="10" class="h-100 border border-info overflow-auto">

      <slot />



    </Col>
  </Row>
  <Row class="align-items-end w-100 ms-0 my-0 border border-dark" noGutters>
    <Col sm="12" class="border border-error"><Footer /></Col>
  </Row>
</Container>
