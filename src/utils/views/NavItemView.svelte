<script lang="ts">
  import { map } from "rxjs";
  import MainContext from "src/main-context/MainContext";
  import { type NavItem } from "../utils/Nav";
  export let ctx: MainContext;
  export let item: NavItem;

  const underlineCharIndex: number = 0; // The index of the character that will be underlined when the section is focused
  const firstChars = item.label.slice(0, underlineCharIndex);
  const underlinedChar = item.label[underlineCharIndex];
  const restChars = item.label.slice(underlineCharIndex + 1);

  const activeWindow$ = ctx.viewCtx.activeWindow$;
  const isActive$ = activeWindow$.pipe(map((w) => w === item.window));

  const sectionFocused$ = item.section.focused$;

  function handleClick() {
    ctx.viewCtx.activeWindow$.next(item.window);
  }
</script>

<button
  class:active={$isActive$}
  class="block focus:bg-transparent"
  on:click={handleClick}
>
  {firstChars}<span class:underline={$sectionFocused$}>{underlinedChar}</span
  >{restChars}
</button>
