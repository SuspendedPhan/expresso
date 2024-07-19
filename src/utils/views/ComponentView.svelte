<script lang="ts">
  import type { Component } from "src/ex-object/ExObject";
  import type MainContext from "src/main-context/MainContext";
  import SelectableView from "src/utils/utils/SelectableView.svelte";
  import AttributeView from "./AttributeView.svelte";

  export let ctx: MainContext;
  export let component: Component;
  const attributes = component.sceneAttributeByProto.values();
</script>

<main>
  <SelectableView {ctx} object={component}>
    <div>Component</div>
    {#each attributes as attribute (attribute.id)}
      <div>
        <AttributeView {ctx} {attribute} />
      </div>
    {/each}
  </SelectableView>
</main>
