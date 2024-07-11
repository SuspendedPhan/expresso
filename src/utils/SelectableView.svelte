<script lang="ts">
  import { type Selectable } from "./Selection";
  import MainContext from "../MainContext";
  import { map, of, share } from "rxjs";
  import Logger from "./Logger";

  export let object: Selectable;
  export let ctx: MainContext;

  const logger = Logger.file("SelectableView.svelte");
  Logger.logToConsole();

  const selected$ = ctx.selection.selectedObject$.pipe(
    map((o) => o === object),
    share()
  );

  selected$.subscribe((selected) => {
    logger.log("selected", selected);
  });

  function handleClick(
    event: MouseEvent & { currentTarget: EventTarget & HTMLElement }
  ) {
    event.stopPropagation();
    console.log("handleClick", object);
    ctx.selection.selectedObject$.next(object);
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
  on:mousedown={handleClick}
  class="border border-black"
  class:border-solid={$selected$}
  class:border-transparent={!$selected$}
>
  <slot />
</div>
