<script lang="ts">
  import type { Component } from "src/ex-object/ExObject";
  import MainContext from "src/main-context/MainContext";
  import ElementLayout from "../layout/ComponentLayout";
  import ComponentView from "./ComponentView.svelte";

  export let ctx: MainContext;
  export let component: Component;
  let clazz = "";
  export { clazz as class };

  const layout = new ElementLayout(component);
  layout.getOutput(component).worldPosition$.subscribe((pos) => {
    console.log("worldPosition", component.id, pos);
  });

  const descendants$ = ctx.eventBus.getDescendants$(component);
  descendants$.subscribe((descendants) => {
    console.log(descendants);

    for (const descendant of descendants) {
      layout.getOutput(descendant).worldPosition$.subscribe((pos) => {
        console.log("worldPosition", descendant.id, pos);
      });
    }
  });
</script>

<div class="{clazz} relative" style="height: 1000px;">
  <ComponentView {ctx} {component} {layout} />
  {#each $descendants$ as descendant}
    <ComponentView {ctx} component={descendant} {layout} />
  {/each}
</div>

<style></style>
