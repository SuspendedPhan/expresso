<script lang="ts">
  import { of } from "rxjs";

  import { type NavSection } from "../utils/Nav";
  import NavCollapsedItemView from "./NavCollapsedItemView.svelte";

  export let section: NavSection;

  const focused$ = of(false);
  const showL$ = of(false);
</script>

<div class="indicator">
  <span
    class:hidden={!$showL$}
    class="indicator-item indicator-right indicator-bottom badge text-xs underline"
    >L</span
  >
  <div class:ring={$focused$} class="flex flex-col p-1">
    {#each section.navItems as item}
      <NavCollapsedItemView {ctx} {item} />
    {/each}
  </div>
</div>
