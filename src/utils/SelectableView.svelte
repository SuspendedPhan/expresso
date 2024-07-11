<script lang="ts">
  import { type Selectable } from "./Selection";
  import MainContext from "../MainContext";
  import { BehaviorSubject, combineLatest } from "rxjs";
  import Logger from "./Logger";

  export let object$: BehaviorSubject<Selectable>;
  export let ctx: MainContext;

  const logger = Logger.file("SelectableView.svelte");
  Logger.logToConsole();

  let selected = false;

  combineLatest([object$, ctx.selection.selectedObject$]).subscribe(
    ([object, selectedObject]) => {
      selected = selectedObject === object;
      console.log("SelectableView", selected, selectedObject, object);
    }
  );

  function handleClick(
    event: MouseEvent & { currentTarget: EventTarget & HTMLElement }
  ) {
    event.stopPropagation();
    ctx.selection.selectedObject$.next(object$.value);
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
  on:mousedown={handleClick}
  class="border border-black"
  class:border-solid={selected}
  class:border-transparent={!selected}
>
  <slot />
</div>
