<script lang="ts">
  import { combineLatestWith, fromEvent, type Observable, of } from "rxjs";
  import { ExprType, type Expr } from "../ExObject";
  import ExprCommand from "./ExprCommand.svelte";
  import type MainContext from "../main-context/MainContext";
  import SelectableView from "../utils/SelectableView.svelte";
  import { onMount } from "svelte";

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

  let exprCommand: ExprCommand;

  onMount(() => {
    const isSelected$ = ctx.selection.isSelected$(expr);
    const sub = fromEvent(document, "keydown")
      .pipe(combineLatestWith(isSelected$))
      .subscribe(([event, selected]) => {
        if (!selected) return;

        const keyEvent = event as KeyboardEvent;
        const printable = keyEvent.key.length === 1;
        const modifiers =
          keyEvent.altKey || keyEvent.ctrlKey || keyEvent.metaKey;
        const targetIsInput = keyEvent.target instanceof HTMLInputElement;
        if (printable && !modifiers && !targetIsInput) {
          exprCommand.focus();
        }
      });

    return () => sub.unsubscribe();
  });
</script>

<main>
  <SelectableView {ctx} object={expr}>
    <span>Expr</span>
    <span>{getText()}</span>
    <ExprCommand on:select={handleSelect} bind:this={exprCommand} />

    <div class="pl-2">
      {#each $args$ as arg (arg.id)}
        <svelte:self expr={arg} {ctx} />
      {/each}
    </div>
  </SelectableView>
</main>
