<script lang="ts">
  import type { ElementLayout } from "src/utils/layout/ElementLayout";
  import { createExObjectLayout } from "src/utils/layout/ExObjectLayout";
  import type { DexObject } from "./DexDomain";
  import FlexContainer from "./FlexContainer.svelte";
  import SveObject from "./SveObject.svelte";
  import TreeView from "./utils/layout/TreeView.svelte";

  export let dexObject: DexObject;

  let clazz = "";
  export { clazz as class };

  const elementLayout: ElementLayout = createExObjectLayout(dexObject);
</script>

<FlexContainer class="p-window {clazz}">
  <TreeView {elementLayout}>
    <SveObject {dexObject} {elementLayout} />
  </TreeView>
</FlexContainer>

<style></style>
