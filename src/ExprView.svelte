<script lang="ts">
  import { concat, concatAll, of, tap } from "rxjs";
  import { NumberExpr, PrimitiveFunctionCallExpr, type Expr } from "./Domain";
  import ExprCommand from "./ExprCommand.svelte";
  import Logger from "./Logger";

  export let expr: Expr;
  Logger.log("ExprView", expr);

  const args$ = (() => {
    if (expr instanceof PrimitiveFunctionCallExpr) {
      return expr.getArgs$().pipe();
    }
    return of([]);
  })().pipe(tap((v) => Logger.log("args$", v)));

  function handleSelect(event: CustomEvent<Expr>) {
    Logger.log("handleSelect", event.detail);

    expr.replace(event.detail);
  }
</script>

<main>
  <span>Expr</span>
  <span>{expr.getText()}</span>
  <ExprCommand on:select={handleSelect} />

  <div class="pl-2">
    {#each $args$ as arg}
      <svelte:self expr={arg} />
    {/each}
  </div>
</main>
