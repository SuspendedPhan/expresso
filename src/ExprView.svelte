<script lang="ts">
  import { concat, concatAll, of } from "rxjs";
  import { NumberExpr, PrimitiveFunctionCallExpr, type Expr } from "./Domain";
  import ExprCommand from "./ExprCommand.svelte";

  export let expr: Expr;
  const args$ = (() => {
    if (expr instanceof PrimitiveFunctionCallExpr) {
      return expr.getArgs$().pipe();
    }
    return of([]);
  })();

  function handleSelect(event: CustomEvent<Expr>) {
    expr.replace(event.detail);
  }
</script>

<main>
  <span>Expr</span>
  <span>{expr.getText()}</span>

  <div class="pl-2">
    {#each $args$ as arg}
      <svelte:self expr={arg} />
    {/each}
  </div>

  <ExprCommand on:select={handleSelect} />
</main>
