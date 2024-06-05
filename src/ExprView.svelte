<script lang="ts">
  import { of } from "rxjs";
  import { NumberExpr, PrimitiveFunctionCallExpr } from "./Domain";

  export let expr: NumberExpr;
  const args$ = (() => {
    if (expr instanceof PrimitiveFunctionCallExpr) {
      return expr.getArgs();
    }
    return of([]);
  })();
</script>

<main>
  <div>Expr</div>
  <div>{expr.getValue()}</div>

  <!-- {#each $args$ as arg$}
    <ExprView expr={$arg$} />
  {/each} -->
</main>
