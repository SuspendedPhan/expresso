<script lang="ts">
  import { ResizeSensor } from "css-element-queries";
  import { first } from "rxjs";
  import type { ExObject } from "src/ex-object/ExObject";

  import ExObjectLayout from "src/utils/layout/ExObjectLayout";
  import ExObjectView from "src/utils/views/ExObjectView.svelte";
  import FlexContainer from "src/utils/views/FlexContainer.svelte";
  import { onMount, tick } from "svelte";
  import TreeView from "../layout/TreeView.svelte";

  export let exObject: ExObject;
  let clazz = "";
  export { clazz as class };

  // export let elementLayout: ElementLayout;
  ctx.debugCtx.treeRoot = "object " + exObject.id;
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

<FlexContainer class="p-window">
  <TreeView {elementLayout} {ctx}>
    <div bind:this={element}>
      <ExObjectView {ctx} {exObject} {elementLayout} />
    </div>
  </TreeView>
</FlexContainer>

<style></style>
