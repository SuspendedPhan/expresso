<script lang="ts">
  import MainContext from "src/main-context/MainContext";
  import { type NavSection } from "../utils/Nav";
  import NavCollapsedItemView from "./NavCollapsedItemView.svelte";
  import { map } from "rxjs";

  export let ctx: MainContext;
  export let section: NavSection;

  const focused$ = section.focused$;
  const showL$ = ctx.viewCtx.navSections[0]?.focused$.pipe(
    map((f) => f && section === ctx.viewCtx.navSections[1])
  );
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
