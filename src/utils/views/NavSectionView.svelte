<script lang="ts">
  import { map } from "rxjs";
  import MainContext from "src/main-context/MainContext";
  import { type NavSection } from "../utils/Nav";
  import KbdShortcutSpan from "./KbdShortcutSpan.svelte";
  import NavItemView from "./NavItemView.svelte";

  export let ctx: MainContext;
  export let section: NavSection;
  const focused$ = section.focused$;

  const underline$ = ctx.viewCtx.navSections[0]!.focused$.pipe(
    map((focused) => focused && section === ctx.viewCtx.navSections[1])
  );
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
