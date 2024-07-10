<script lang="ts">
  import { combineLatest } from "rxjs";
  import ExprCommand from "./ExprCommand.svelte";
  import Logger from "./utils/Logger";
  import MainContext from "./MainContext";
  import SelectableView from "./utils/SelectableView.svelte";
  import { CallExpr, NumberExpr, type Expr } from "./ExprFactory";

  export let ctx: MainContext;
  export let expr: Expr;

  Logger.file("ExprView").log("expr", expr);

  let args: Expr[] = [];

  if (expr instanceof CallExpr) {
    expr.args$.subscribe((aa) => {
      combineLatest(aa).subscribe((v) => {
        args = v;
      });
    });
  }

  let text: string;
  if (expr instanceof NumberExpr) {
    expr.readonlyExpr.value$.subscribe((v) => {
      text = v.toString();
    });
  } else if (expr instanceof CallExpr) {
    text = "+";
  } else {
    console.log(expr);
    throw new Error(`Unknown expr type`);
  }

  function handleSelect(e: CustomEvent<string>): void {
    const text = e.detail;
    const value = parseFloat(text);
    if (!isNaN(value)) {
      expr.exprReplacer.replaceWithNumberExpr(value);
    } else if (text === "+") {
      expr.exprReplacer.replaceWithCallExpr();
    }
  }
</script>

<main>
  <SelectableView {ctx} object={expr.readonlyExpr}>
    <span>Expr</span>
    <span>{text}</span>
    <ExprCommand on:select={handleSelect} />

    <div class="pl-2">
      {#each args as arg (arg.readonlyExpr.id)}
        <svelte:self expr={arg} {ctx} />
      {/each}
    </div>
  </SelectableView>
</main>
