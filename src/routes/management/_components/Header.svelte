<script lang="ts">
  import { Nav, NavItem, NavLink, Navbar, Form, InputGroup, Input, InputGroupText } from "sveltestrap";
  import Icon from "../../_components/Icon.svelte";
  import { _ } from "../../../i18n";
  import SelectLanguage from "../../_components/SelectLanguage.svelte";
  import { signout } from "../../_stores/user";
  import { url } from "@roxi/routify";
  import { active_section } from "../_stores/active_section";
  import sections from "../_stores/sections";
</script>

<Navbar class="py-0 px-1">
  <Nav tabs class="align-items-center w-100" style="background-color: #f4f4f4;">
    {#each $sections as section}
      <NavItem>
        <NavLink
          href="{$url('/management/' + section.name)}"
          title="{$_(section.name)}"
          on:click="{() => {
            $active_section = section;
          }}"
          active="{$active_section.name == section.name}">
          <Icon name="{section.icon}" />
          {#if section.notifications > 0}
            <span class="badge rounded-pill bg-danger custom-badge">{section.notifications}</span>
          {/if}
        </NavLink>
      </NavItem>
    {/each}
    <NavItem>
      <NavLink href="/" title="{$_('published')}">
        <Icon name="globe" />
      </NavLink>
    </NavItem>
    <Form inline={true} class="ms-auto">
      <InputGroup size="sm">
        <Input placeholder="{$_('searching_for_what')}" />
        <InputGroupText><Icon name="search" /></InputGroupText>
      </InputGroup>
    </Form>
    &nbsp;&nbsp;
    <NavItem>
      <SelectLanguage />
    </NavItem>
    <NavItem>
      <NavLink href="#" title="{$_('logout')}" on:click="{signout}">
        <Icon name="power" />
      </NavLink>
    </NavItem>
  </Nav>
</Navbar>

<style>
  .custom-badge {
    position: relative;
    right: 0.5rem;
    top: -0.5rem;
    border: 2px solid #fff;
    font-size: 0.6rem;
  }
</style>
