<script lang="ts">
  import { ResizeSensor } from "css-element-queries";
  import type { ExObject } from "src/ex-object/ExObject";

  import type { ElementLayout } from "src/utils/layout/ElementLayout";
  import { createExObjectLayout } from "src/utils/layout/ExObjectLayout";
  import { DexRuntime } from "src/utils/utils/DexRuntime";
  import ExObjectView from "src/utils/views/ExObjectView.svelte";
  import FlexContainer from "src/utils/views/FlexContainer.svelte";
  import { onMount, tick } from "svelte";
  import TreeView from "../layout/TreeView.svelte";
  import { log5 } from "src/utils/utils/Log5";
  import { Deferred } from "effect";

  const log55 = log5("RootExObjectView.svelte");

  export let exObject: ExObject;
  let clazz = "";
  export { clazz as class };

  let elementLayout: ElementLayout;

  let element: HTMLElement;

  let sensor: ResizeSensor;

  onMount(() => {
    log55.debug("onMount");
    DexRuntime.runPromise(createExObjectLayout(exObject)).then((layout) => {
      log55.debug("layout", layout);

      elementLayout = layout;
      sensor = new ResizeSensor(element, () => {
        tick().then(() => {
          elementLayout.recalculate();
        });
      });
    });

    return () => {
      sensor.detach();
    };
  });
</script>

<FlexContainer class="p-window {clazz}">
  {#if elementLayout}
    <TreeView {elementLayout}>
      <div bind:this={element}>
        <ExObjectView {exObject} {elementLayout} />
      </div>
    </TreeView>
  {/if}
</FlexContainer>

<style></style>
