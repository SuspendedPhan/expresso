<script lang="ts">
  import { ResizeSensor } from "css-element-queries";
  import { Effect, Scope } from "effect";
  import { tick } from "svelte";
  import type { DexExpr } from "./DexDomain";
  import { dexMakeSvelteScope, DexRuntime } from "./DexRuntime";
  import SveExpr from "./SveExpr.svelte";
  import type { ElementLayout } from "./utils/layout/ElementLayout";
  import { createExprLayout } from "./utils/layout/ExprLayout";
  import TreeView from "./utils/layout/TreeView.svelte";

  export let expr: DexExpr;

  let elementLayout: ElementLayout;
  let element: HTMLElement;
  let sensor: ResizeSensor;

  let ready = false;

  dexMakeSvelteScope().then((scope) => {
    Effect.gen(function* () {
      const layout = yield* createExprLayout(expr);
      elementLayout = layout;
      ready = true;

      // Wait for element to be set
      yield* Effect.sleep(0);

      console.log("element", element);

      sensor = new ResizeSensor(element, () => {
        tick().then(() => {
          elementLayout.recalculate();
        });
      });

      yield* Scope.addFinalizer(
        scope,
        Effect.gen(function* () {
          sensor.detach();
        }),
      );
    }).pipe(Effect.forkIn(scope), DexRuntime.runPromise);
  });
</script>

<TreeView {elementLayout}>
  <SveExpr {expr} {elementLayout} />
</TreeView>
