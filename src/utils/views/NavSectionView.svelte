<script lang="ts">
  import MainContext from "src/main-context/MainContext";
  import NavItemView from "./NavItemView.svelte";
  import { type NavSection } from "../utils/NavUtils";

  export let ctx: MainContext;
  export let section: NavSection;
  const focused$ = section.focused$;
</script>

<div class:ring={$focused$} class="p-1">
  <div class="menu-title">{section.title}</div>

  {#each section.navItems as item}
    <li>
      <NavItemView {ctx} {item}></NavItemView>
    </li>
  {/each}
</div>
