<script lang="ts">
  import { Effect, Option } from "effect";
  import { AppStateCtx } from "./AppStateCtx";
  import { FocusReducer, type DexFocusTarget } from "./DexFocus";
  import { DexGetter } from "./DexGetter";
  import { DexRuntime, dexRunReducer } from "./DexRuntime";

  export let target: DexFocusTarget;

  let focused = false;

  Effect.gen(function* () {
    const appState = yield* AppStateCtx.getAppState;
    focused = Option.isSome(DexGetter.isFocused(appState, target));
  }).pipe(DexRuntime.runPromise);

  function onMouseDown() {
    dexRunReducer(FocusReducer.focusTarget(target));
  }

  let clazz: string = "";
  export { clazz as class };
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div on:mousedown|stopPropagation={onMouseDown} class="{clazz} ring-black" class:ring-2={focused}>
  <slot />
</div>
