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

  export let exObject: ExObject;
  let clazz = "";
  export { clazz as class };

  let elementLayout: ElementLayout;

  let element: HTMLElement;

  onMount(() => {
    DexRuntime.runPromise(createExObjectLayout(exObject)).then((layout) => {
      elementLayout = layout;
    });

    const sensor = new ResizeSensor(element, () => {
      tick().then(() => {
        elementLayout.recalculate();
      });
    });

    return () => {
      sensor.detach();
    };
  });
</script>

<FlexContainer class="p-window {clazz}">
  <TreeView {elementLayout}>
    <div bind:this={element}>
      <ExObjectView {exObject} {elementLayout} />
    </div>
  </TreeView>
</FlexContainer>

<style></style>
