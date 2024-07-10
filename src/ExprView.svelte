<script lang="ts">
  import { Subject } from "rxjs";
  import ExprCommand from "./ExprCommand.svelte";
  import Logger from "./utils/Logger";
  import MainContext from "./MainContext";
  import SelectableView from "./utils/SelectableView.svelte";
  import type { Expr } from "./ExprFactory";

  export let ctx: MainContext;
  export let expr$: Subject<Expr>;

  Logger.file("ExprView").log("expr", expr$);

  let text: string;
  let args: Subject<Expr>[] = [];

  expr$.subscribe((expr) => {
    if (expr.type === "NumberExpr") {
      text = expr.value.toString();
    } else if (expr.type === "CallExpr") {
      text = "+";
    }

    if (expr.type === "CallExpr") {
      args = expr.args;
    }
  });

  function handleSelect(e: CustomEvent<string>): void {
    const text = e.detail;
    const value = parseFloat(text);
    if (!isNaN(value)) {
      expr$.next(ctx.exprFactory.createNumberExpr(value));
    } else if (text === "+") {
      expr$.next(ctx.exprFactory.createCallExpr());
    }
  }
</script>

<main>
  <SelectableView {ctx} object={$expr$}>
    <span>Expr</span>
    <span>{text}</span>
    <ExprCommand on:select={handleSelect} />

    <div class="pl-2">
      {#each args as arg}
        <svelte:self expr={arg} {ctx} />
      {/each}
    </div>
  </SelectableView>
</main>
