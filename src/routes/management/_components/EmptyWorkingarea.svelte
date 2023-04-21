<script>
  import { active_section } from "../_stores/active_section";
  import { _ } from "../../../i18n";
  import Icon from "../../_components/Icon.svelte";
</script>

<div
  class="alert alert-warning alert-dismissible fade show text-center m-2"
  role="alert"
>
  <h5 class="mt-0 mb-2">
    {#if $active_section.icon}<Icon
        name={$active_section.icon}
        class="pe-1"
      />{/if}
    {#if $active_section.name}{$_($active_section.name)}{/if}
  </h5>
  {@html $_("select_entry_from_sidebar")}
</div>


