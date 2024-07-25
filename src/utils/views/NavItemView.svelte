<script lang="ts">
  import { map } from "rxjs";
  import MainContext from "src/main-context/MainContext";
  import { NavItem } from "../utils/NavUtils";
  export let ctx: MainContext;
  export let item: NavItem;

  const underlineCharIndex: number = 0; // The index of the character that will be underlined when the section is focused
  const firstChars = item.label.slice(0, underlineCharIndex);
  const underlinedChar = item.label[underlineCharIndex];
  const restChars = item.label.slice(underlineCharIndex + 1);

  const activeWindow$ = ctx.viewCtx.activeWindow$;
  const isActive$ = activeWindow$.pipe(map((w) => w === item.window));
  const navCollapsed$ = ctx.viewCtx.navCollapsed$;

  const sectionFocused$ = item.section.focused$;

  function handleClick() {
    ctx.viewCtx.activeWindow$.next(item.window);
  }
</script>

{#if $navCollapsed$}
  <button class="{item.iconClasses} block p-2" on:click={handleClick}> </button>
{:else}
  <button class:active={$isActive$} class="block" on:click={handleClick}>
    {firstChars}<span class:underline={$sectionFocused$}>{underlinedChar}</span
    >{restChars}
  </button>
{/if}
