<script lang="ts">
  import { BehaviorSubject, Subject } from "rxjs";
  import ExprCommand from "./ExprCommand.svelte";
  import Logger from "./utils/Logger";
  import MainContext from "./MainContext";
  import SelectableView from "./utils/SelectableView.svelte";
  import type { Expr } from "./ExprFactory";
  import { type Selectable } from "./utils/Selection";

  export let ctx: MainContext;
  export let expr$: BehaviorSubject<Expr>;

  Logger.file("ExprView").log("expr", expr$);

  let text: string;
  let args: BehaviorSubject<Expr>[] = [];

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

  const selectable$ = new BehaviorSubject<Selectable>(expr$.value);
  expr$.subscribe((v) => selectable$.next(v));

  function handleSelect(e: CustomEvent<string>): void {
    const text = e.detail;
    const value = parseFloat(text);
    if (!isNaN(value)) {
      ctx.exprFactory.replaceWithNumberExpr(expr$, value);
    } else if (text === "+") {
      ctx.exprFactory.replaceWithCallExpr(expr$);
    }
  }
</script>

<main>
  <SelectableView {ctx} object$={selectable$}>
    <span>Expr</span>
    <span>{text}</span>
    <ExprCommand on:select={handleSelect} />

    <div class="pl-2">
      {#each args as arg}
        <svelte:self expr$={arg} {ctx} />
      {/each}
    </div>
  </SelectableView>
</main>
