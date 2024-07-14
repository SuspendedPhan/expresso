<script lang="ts">
  import { type Selectable } from "./Selection";
  import MainContext from "../MainContext";
  import { combineLatest, map, Observable } from "rxjs";

  export let object$: Observable<Selectable>;
  export let ctx: MainContext;

  let selected = false;

  combineLatest([object$, ctx.selection.selectedObject$]).subscribe(
    ([object, selectedObject]) => {
      selected = selectedObject === object;
    }
  );

  const handleClick$ = object$.pipe(
    map((object) => {
      return (event: MouseEvent) => {
        event.stopPropagation();
        ctx.selection.selectedObject$.next(object);
      };
    })
  );
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
  on:mousedown={$handleClick$}
  class="border border-black"
  class:border-solid={selected}
  class:border-transparent={!selected}
>
  <slot />
</div>
