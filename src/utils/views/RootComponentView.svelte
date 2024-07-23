<script lang="ts">
  import { debounceTime, throttleTime, windowTime } from "rxjs";
  import type { Component } from "src/ex-object/ExObject";
  import MainContext from "src/main-context/MainContext";
  import ElementLayout from "../layout/ComponentLayout";
  import { type Point } from "../layout/Layout";
  import ComponentView from "./ComponentView.svelte";

  export let ctx: MainContext;
  export let component: Component;
  let clazz = "";
  export { clazz as class };

  const layout = new ElementLayout(component);
  const worldPosById: Record<string, Point> = {};
  console.log("worldPositionPosById", worldPosById);
  layout.getOutput(component).worldPosition$.subscribe((pos) => {
    worldPosById[component.id] = pos;
  });

  const descendants$ = ctx.eventBus.getDescendants$(component);
  descendants$.subscribe((descendants) => {
    for (const descendant of descendants) {
      layout.getOutput(descendant).worldPosition$.subscribe((pos) => {
        worldPosById[descendant.id] = pos;
      });
      layout
        .getOutput(descendant)
        .worldPosition$.pipe(debounceTime(100))
        .subscribe(() => {
          console.log("worldPositionByPosId", worldPosById);
        });
    }
  });
  descendants$.pipe(debounceTime(100)).subscribe((descendants) => {
    console.log(
      "descendants",
      descendants.map((d) => d.id)
    );
  });

  const child1 = ctx.componentMutator.addChild(component);
  ctx.componentMutator.addChild(child1);
</script>

<div class="{clazz} relative" style="height: 1000px;">
  {#key component.id}
    <ComponentView {ctx} {component} {layout} />
  {/key}
  {#each $descendants$ as descendant}
    {#key descendant.id}
      <ComponentView {ctx} component={descendant} {layout} />
    {/key}
  {/each}
</div>

<style></style>
