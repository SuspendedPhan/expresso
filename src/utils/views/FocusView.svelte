<script lang="ts">
  import { Effect } from "effect";
  import { dexMakeSvelteScope, DexRuntime } from "../utils/DexRuntime";
  import { type FocusViewPropIn, type FocusViewState } from "./FocusView";

  export let propIn: FocusViewPropIn;

  let clazz: string = "";
  export { clazz as class };

  let focused: FocusViewState["focused"];
  let onMouseDown: FocusViewState["onMouseDown"];

  dexMakeSvelteScope().then((scope) => {
    Effect.gen(function* () {
      const state = yield* propIn(scope);
      focused = state.focused;
      onMouseDown = state.onMouseDown;
      // focused.subscribe((v) => {
      //   console.log(`v`, v);
      // });
    }).pipe(DexRuntime.runPromise);
  });
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
  on:mousedown|stopPropagation={onMouseDown}
  class="{clazz} ring-black"
  class:ring-2={$focused}
>
  <slot />
</div>
