<script lang="ts">
  import { of } from "rxjs";
  import { CallExpr, type Expr } from "./Domain";
  import ExprCommand from "./ExprCommand.svelte";
  import Logger from "./Logger";
  import MainContext from "./MainContext";

  export let ctx: MainContext;
  export let expr: Expr;

  Logger.topic("ExprView").log("expr", expr);

  const args$ = expr instanceof CallExpr ? expr.getArgs$() : of([]);
  args$.subscribe((v) => Logger.topic("ExprView").log("args$", v));

  function handleSelect(e: CustomEvent<Expr>): void {
    Logger.debug("handleSelect", e.detail);
    expr.replace(e.detail);
  }
</script>

<main>
  <span>Expr</span>
  <span>{expr.getText()}</span>
  <ExprCommand {ctx} on:select={handleSelect} />

  <div class="pl-2">
    {#each $args$ as arg (arg)}
      <svelte:self expr={arg} {ctx} />
    {/each}
  </div>
</main>
