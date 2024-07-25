<script lang="ts">
  import { map } from "rxjs";
  import MainContext from "src/main-context/MainContext";
  import { Window } from "src/main-context/MainViewContext";
  export let ctx: MainContext;
  export let window: Window;
  export let label: string;
  export let sectionFocused: boolean;
  export let underlineCharIndex: number = 0; // The index of the character that will be underlined when the section is focused

  const firstChars = label.slice(0, underlineCharIndex);
  const underlinedChar = label[underlineCharIndex];
  const restChars = label.slice(underlineCharIndex + 1);

  const activeWindow$ = ctx.viewCtx.activeWindow$;
  const isActive$ = activeWindow$.pipe(map((w) => w === window));
  const navCollapsed$ = ctx.viewCtx.navCollapsed$;

  function handleClick() {
    ctx.viewCtx.activeWindow$.next(window);
  }
</script>

{#if $navCollapsed$}
  <button class="fa-solid fa-bars" on:click={handleClick}> </button>
{:else}
  <button class:active={$isActive$} class="block" on:click={handleClick}>
    {firstChars}<span class:underline={sectionFocused}>{underlinedChar}</span
    >{restChars}
  </button>
{/if}
