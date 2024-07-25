<script lang="ts">
  import MainContext from "src/main-context/MainContext";
  import { type NavSection } from "../utils/Nav";
  import NavCollapsedItemView from "./NavCollapsedItemView.svelte";

  export let ctx: MainContext;
  export let section: NavSection;

  const focused$ = section.focused$;
</script>

<div class:ring={$focused$}>
  {#each section.navItems as item}
    <NavCollapsedItemView {ctx} {item} />
  {/each}
</div>
