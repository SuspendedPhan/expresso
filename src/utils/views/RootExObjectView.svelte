<script lang="ts">
  import { ResizeSensor } from "css-element-queries";
  import type { ExObject } from "src/ex-object/ExObject";

  import { Effect, Scope } from "effect";
  import type { ElementLayout } from "src/utils/layout/ElementLayout";
  import { createExObjectLayout } from "src/utils/layout/ExObjectLayout";
  import { DexRuntime } from "src/utils/utils/DexRuntime";
  import { log5 } from "src/utils/utils/Log5";
  import ExObjectView from "src/utils/views/ExObjectView.svelte";
  import FlexContainer from "src/utils/views/FlexContainer.svelte";
  import { tick } from "svelte";
  import TreeView from "../layout/TreeView.svelte";
  import { dexMakeSvelteScope } from "../utils/DexRuntime";
  import type { DexSetup } from "../utils/EffectUtils";
  import { ExObjectViewCtx, type ExObjectViewState } from "./ExObjectView";

  const log55 = log5("RootExObjectView.svelte");

  export let exObject: ExObject;
  let clazz = "";
  export { clazz as class };

  let elementLayout: ElementLayout;
  let element: HTMLElement;
  let sensor: ResizeSensor;
  let exObjectSetup: DexSetup<ExObjectViewState>;

  let ready = false;

  dexMakeSvelteScope().then((scope) => {
    Effect.gen(function* () {
      const exobjectviewctx = yield* ExObjectViewCtx;
      const prop = yield* exobjectviewctx.createProp(exObject);
      exObjectSetup = prop.setup;

      const layout = yield* createExObjectLayout(exObject);
      elementLayout = layout;
      log55.debug("layout", layout);

      elementLayout = layout;
      log55.debug("element", element);

      ready = true;

      // Wait for element to be set
      yield* Effect.sleep(0);
      log55.debug("element2", element);

      sensor = new ResizeSensor(element, () => {
        tick().then(() => {
          log55.debug("Recalculating layout");
          elementLayout.recalculate();
        });
      });

      yield* Scope.addFinalizer(
        scope,
        Effect.gen(function* () {
          sensor.detach();
        })
      );
    }).pipe(DexRuntime.runPromise);
  });
</script>

{#if ready}
  <FlexContainer class="p-window {clazz}">
    {#if elementLayout}
      <!-- {#key exObject.id} -->
      <TreeView {elementLayout}>
        <div bind:this={element}>
          <ExObjectView setup={exObjectSetup} {elementLayout} />
        </div>
      </TreeView>
      <!-- {/key} -->
    {/if}
  </FlexContainer>
{/if}

<style></style>
