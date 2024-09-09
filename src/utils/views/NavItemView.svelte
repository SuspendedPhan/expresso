<script lang="ts">
  import { map } from "rxjs";

  import { type NavItem } from "../utils/Nav";
  import KbdShortcutSpan from "./KbdShortcutSpan.svelte";
  export let ctx: MainContext;
  export let item: NavItem;

  const isActive$ = ctx.viewCtx.activeWindow$.pipe(
    map((w) => w === item.window)
  );

  const sectionFocused$ = ctx.navFocusCtx.sectionFocused$(item.section);

  function handleClick() {
    ctx.viewCtx.activeWindow$.next(item.window);
  }
</script>

<button
  class:active={$isActive$}
  class="block focus:bg-transparent"
  on:click={handleClick}
>
  <KbdShortcutSpan label={item.label} showShortcut={$sectionFocused$} />
</button>
