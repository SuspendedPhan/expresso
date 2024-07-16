<script lang="ts">
  import { Observable, of } from "rxjs";
  import { ExprType, type Expr } from "./ExObject";
  import ExprCommand from "./ExprCommand.svelte";
  import MainContext from "./MainContext";
  import SelectableView from "./utils/SelectableView.svelte";

  export let ctx: MainContext;
  export let expr: Expr;

  let args$: Observable<readonly Expr[]>;
  if (expr.exprType === ExprType.CallExpr) {
    args$ = expr.args$;
  } else {
    args$ = of([]);
  }

  function getText() {
    switch (expr.exprType) {
      case ExprType.NumberExpr:
        return expr.value.toString();
      case ExprType.CallExpr:
        return "+";
      default:
        return "";
    }
  }

  function handleSelect(e: CustomEvent<string>) {
    const text = e.detail;
    const value = parseFloat(text);
    if (!isNaN(value)) {
      ctx.mutator.replaceWithNumberExpr(expr, value);
    } else if (text === "+") {
      ctx.mutator.replaceWithCallExpr(expr);
    }
  }
</script>

<main>
  <SelectableView {ctx} object={expr}>
    <span>Expr</span>
    <span>{getText()}</span>
    <ExprCommand on:select={handleSelect} />

    <div class="pl-2">
      {#each $args$ as arg (arg.id)}
        <svelte:self expr={arg} {ctx} />
      {/each}
    </div>
  </SelectableView>
</main>
