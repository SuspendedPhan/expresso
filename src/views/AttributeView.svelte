<script lang="ts">
  import { map } from "rxjs";
  import type { Attribute } from "../ExObject";
  import ExprView from "./ExprView.svelte";
  import type MainContext from "../main-context/MainContext";
  import SelectableView from "../utils/SelectableView.svelte";

  export let ctx: MainContext;
  export let attribute: Attribute;

  let expr$ = attribute.expr$;
  const exprId$ = expr$.pipe(map((expr) => expr.id));
</script>

<main>
  <SelectableView {ctx} object={attribute}>
    <div>Attribute</div>
    {#key $exprId$}
      <ExprView {ctx} expr={$expr$} />
    {/key}
  </SelectableView>
</main>
