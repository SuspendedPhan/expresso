<script lang="ts">
  import type { NumberExpr } from "./Domain";

  export let expr: NumberExpr;
  const children = expr.getChildren();
</script>

<main>
  <div>Expr</div>
  <div>{expr.getValue()}</div>
</main>
