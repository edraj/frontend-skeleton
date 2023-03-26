<script lang="ts">
  import { Navbar, NavbarBrand } from "sveltestrap";
  import SelectLanguage from "./SelectLanguage.svelte";
  import LocalizedValue from "./LocalizedValue.svelte";
  import { website } from "../../config";
</script>

<Navbar class=" px-3 mt-3 " color="light" light>
  <SelectLanguage />
  <LocalizedValue field="{website.footer}" />
  <NavbarBrand href="/"><LocalizedValue field="{website.display_name}" /></NavbarBrand>
</Navbar>
