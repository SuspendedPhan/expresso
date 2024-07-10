<script lang="ts">
  import { combineLatest } from "rxjs";
  import ExprCommand from "./ExprCommand.svelte";
  import Logger from "./utils/Logger";
  import MainContext from "./MainContext";
  import SelectableView from "./utils/SelectableView.svelte";
  import type { ExprMut } from "./ExprFactory";

  export let ctx: MainContext;
  export let expr: ExprMut;

  Logger.file("ExprView").log("expr", expr);

  let text: string;
  let args: ExprMut[] = [];

  if (expr.type === "CallExprMut") {
    expr.argsMut$$.subscribe((aa) => {
      combineLatest(aa).subscribe((v) => {
        args = v;
      });
    });
  }

  switch (expr.exprBaseMut.expr$.type) {
    case "NumberExpr":
      expr.exprBaseMut.expr$.value$.subscribe((v) => {
        text = v.toString();
      });
      break;
    case "CallExpr":
      text = "+";
      break;
    default:
      throw new Error(`Unknown expr type`);
  }

  function handleSelect(e: CustomEvent<string>): void {
    const text = e.detail;
    const value = parseFloat(text);
    if (!isNaN(value)) {
      expr.exprBaseMut.replaceWithNumberExpr$(value);
    } else if (text === "+") {
      expr.exprBaseMut.replaceWithCallExpr$();
    }
  }
</script>

<main>
  <SelectableView {ctx} object={expr.exprBaseMut.expr$}>
    <span>Expr</span>
    <span>{text}</span>
    <ExprCommand on:select={handleSelect} />

    <div class="pl-2">
      {#each args as arg (arg.exprBaseMut.expr$.exprBase.id)}
        <svelte:self expr={arg} {ctx} />
      {/each}
    </div>
  </SelectableView>
</main>
