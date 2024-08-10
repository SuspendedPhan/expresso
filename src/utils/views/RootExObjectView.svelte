<script lang="ts">
  import { ResizeSensor } from "css-element-queries";
  import { first } from "rxjs";
  import type { ExObject } from "src/ex-object/ExObject";
  import MainContext from "src/main-context/MainContext";
  import type { ElementLayout } from "src/utils/layout/ElementLayout";
  import { Constants } from "src/utils/utils/ViewUtils";
  import ExObjectView from "src/utils/views/ExObjectView.svelte";
  import { onMount, tick } from "svelte";
  import TreeView from "../layout/TreeView.svelte";

  export let ctx: MainContext;
  export let exObject: ExObject;
  let clazz = "";
  export { clazz as class };

  export let elementLayout: ElementLayout;

  let element: HTMLElement;

  onMount(() => {
    new ResizeSensor(element, () => {
      tick().then(() => {
        elementLayout.recalculate();
      });
    });

    ctx.viewCtx.exObjectLayouts$.pipe(first()).subscribe((layouts) => {
      ctx.viewCtx.exObjectLayouts$.next([...layouts, elementLayout]);
    });

    return () => {
      ctx.viewCtx.exObjectLayouts$.pipe(first()).subscribe((layouts) => {
        ctx.viewCtx.exObjectLayouts$.next(
          layouts.filter((layout) => layout !== elementLayout)
        );
      });
    };
  });
</script>

<div class="{clazz} {Constants.WindowPaddingClass}">
  <TreeView {elementLayout} {ctx}>
    <div bind:this={element}>
      <ExObjectView {ctx} {exObject} {elementLayout} />
    </div>
  </TreeView>
</div>

<style></style>
