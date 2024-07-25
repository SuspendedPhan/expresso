<script lang="ts">
  import { map } from "rxjs";
  import MainContext from "src/main-context/MainContext";
  import { Window } from "src/main-context/MainViewContext";
  export let ctx: MainContext;
  export let window: Window;
  export let label: string;
  export let sectionFocused: boolean;

  const firstChar = label[0];
  const restChars = label.slice(1);

  const activeWindow$ = ctx.viewCtx.activeWindow$;
  const isActive$ = activeWindow$.pipe(map((w) => w === window));

  function handleClick() {
    ctx.viewCtx.activeWindow$.next(window);
  }
</script>

<button class:active={$isActive$} class="gap-0" on:click={handleClick}>
  <span class:underline={sectionFocused} class="m-0">{firstChar}</span
  >{restChars}
</button>
