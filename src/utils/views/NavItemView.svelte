<script lang="ts">
  import { map } from "rxjs";
  import MainContext from "src/main-context/MainContext";
  import { Window } from "src/main-context/MainViewContext";
  export let ctx: MainContext;
  export let window: Window;
  const activeWindow$ = ctx.viewCtx.activeWindow$;
  const isActive$ = activeWindow$.pipe(map((w) => w === window));

  function handleClick() {
    ctx.viewCtx.activeWindow$.next(window);
  }
</script>

<button class:active={$isActive$} on:click={handleClick}>
  <slot />
</button>
