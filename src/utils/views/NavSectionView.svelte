<script lang="ts">
  import MainContext from "src/main-context/MainContext";
  import NavItemView from "./NavItemView.svelte";
  import { type NavSection } from "../utils/Nav";
  import { map } from "rxjs";

  export let ctx: MainContext;
  export let section: NavSection;
  const focused$ = section.focused$;

  const firstChar = section.title[0];
  const restChars = section.title.slice(1);
  const underline$ = ctx.viewCtx.navSections[0]?.focused$.pipe(
    map((focused) => focused && section === ctx.viewCtx.navSections[1])
  );
</script>

<div class:ring={$focused$} class="p-1">
  <div class="menu-title">
    <span class:underline={$underline$}>{firstChar}</span>{restChars}
  </div>

  {#each section.navItems as item}
    <li>
      <NavItemView {ctx} {item}></NavItemView>
    </li>
  {/each}
</div>
