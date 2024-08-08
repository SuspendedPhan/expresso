<script lang="ts">
  import { ResizeSensor } from "css-element-queries";
  import { first } from "rxjs";
  import type { ExObject } from "src/ex-object/ExObject";
  import MainContext from "src/main-context/MainContext";
  import { onMount, tick } from "svelte";
  import TreeView from "../layout/TreeView.svelte";
  import ExObjectLayout from "src/utils/layout/ExObjectLayout";
  import ExObjectView from "src/utils/views/ExObjectView.svelte";
  import { Constants } from "src/utils/utils/ViewUtils";

  export let ctx: MainContext;
  export let exObject: ExObject;
  let clazz = "";
  export { clazz as class };

  const elementLayout = ExObjectLayout.create(ctx, exObject);

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
