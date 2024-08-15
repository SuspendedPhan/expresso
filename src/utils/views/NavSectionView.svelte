<script lang="ts">
  import { of } from "rxjs";
  import MainContext from "src/main-context/MainContext";
  import { type NavSection } from "../utils/Nav";
  import KbdShortcutSpan from "./KbdShortcutSpan.svelte";
  import NavItemView from "./NavItemView.svelte";

  export let ctx: MainContext;
  export let section: NavSection;
  const focused$ = of(false);
  const underline$ = of(false);
</script>

<div class:ring={$focused$} class="p-1">
  <div class="menu-title">
    <KbdShortcutSpan label={section.title} showShortcut={$underline$} />
  </div>

  {#each section.navItems as item}
    <li>
      <NavItemView {ctx} {item}></NavItemView>
    </li>
  {/each}
</div>
