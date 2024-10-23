<script lang="ts">
  import { ResizeSensor } from "css-element-queries";

  import { Effect, Scope } from "effect";
  import type { ElementLayout } from "src/utils/layout/ElementLayout";
  import { createExObjectLayout } from "src/utils/layout/ExObjectLayout";
  import { log5 } from "src/utils/utils/Log5";
  import { tick } from "svelte";
  import type { DexObject } from "./DexDomain";
  import { dexMakeSvelteScope, DexRuntime } from "./DexRuntime";
  import FlexContainer from "./FlexContainer.svelte";
  import TreeView from "./utils/layout/TreeView.svelte";
  import SveObject from "./SveObject.svelte";

  const log55 = log5("RootExObjectView.svelte");

  export let dexObject: DexObject;

  let clazz = "";
  export { clazz as class };

  let elementLayout: ElementLayout;
  let element: HTMLElement;
  let sensor: ResizeSensor;

  let ready = false;

  dexMakeSvelteScope().then((scope) => {
    Effect.gen(function* () {
      const layout = yield* createExObjectLayout(dexObject);
      elementLayout = layout;
      ready = true;

      // Wait for element to be set
      yield* Effect.sleep(1000);
      yield* Effect.sleep(0);

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
        }),
      );
    }).pipe(DexRuntime.runPromise);
  });
</script>

{#if ready}
  <FlexContainer class="p-window {clazz}">
    {#if elementLayout}
      <!-- {#key exObject.id} -->
      <TreeView {elementLayout}>
        Hello
        <div bind:this={element}>
          <SveObject {dexObject} {elementLayout} />
        </div>
      </TreeView>
      <!-- {/key} -->
    {/if}
  </FlexContainer>
{/if}

<style></style>
