<script lang="ts">
  import { Effect } from "effect";
  import type { DexFocusTarget } from "./DexFocus";
  import { DexReducer } from "./DexReducer";
  import { DexRuntime, DexRuntime_RunReducer } from "./DexRuntime";
  import { AppStateCtx } from "./AppStateCtx";
  import { DexGetter } from "./DexGetter";

  export let target: DexFocusTarget;

  let focused = false;

  Effect.gen(function* () {
    const appState = yield* AppStateCtx.getAppState;
    focused = DexGetter.isFocused(appState, target);
  }).pipe(DexRuntime.runPromise);

  function onMouseDown() {
    DexRuntime_RunReducer(DexReducer.AppState.setFocus(target));
  }

  let clazz: string = "";
  export { clazz as class };
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div on:mousedown|stopPropagation={onMouseDown} class="{clazz} ring-black" class:ring-2={focused}>
  <slot />
</div>
