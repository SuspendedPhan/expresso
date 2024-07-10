<script lang="ts">
  import {
    combineLatest,
    combineLatestAll,
    Observable,
    of,
    switchAll,
    switchMap,
  } from "rxjs";
  // import { CallExpr, type Expr } from "./Domain";
  import ExprCommand from "./ExprCommand.svelte";
  import Logger from "./utils/Logger";
  import MainContext from "./MainContext";
  import SelectableView from "./utils/SelectableView.svelte";
  import {
    ReadonlyCallExpr,
    ReadonlyNumberExpr,
    type ReadonlyExpr,
  } from "./domain/Expr";

  export let ctx: MainContext;
  export let expr: ReadonlyExpr;

  Logger.file("ExprView").log("expr", expr);

  let args: ReadonlyExpr[] = [];

  if (expr instanceof ReadonlyCallExpr) {
    expr.args$.subscribe((aa) => {
      combineLatest(aa).subscribe((v) => {
        args = v;
      });
    });
  }

  let text: string;
  if (expr instanceof ReadonlyNumberExpr) {
    expr.value$.subscribe((v) => {
      text = v.toString();
    });
  } else if (expr instanceof ReadonlyCallExpr) {
    text = "+";
  } else {
    throw new Error(`Unknown expr type`);
  }

  function handleSelect(e: CustomEvent<Expr>): void {
    Logger.debug("handleSelect", e.detail);
    expr.replace(e.detail);
  }
</script>

<main>
  <SelectableView {ctx} object={expr}>
    <span>Expr</span>
    <span>{text}</span>
    <ExprCommand {ctx} on:select={handleSelect} />

    <div class="pl-2">
      {#each args as arg (arg.id)}
        <svelte:self expr={arg} {ctx} />
      {/each}
    </div>
  </SelectableView>
</main>
