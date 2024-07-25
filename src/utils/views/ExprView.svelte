<script lang="ts">
  import { combineLatestWith, fromEvent, map, of, type Observable } from "rxjs";
  import { ExprType, type Expr } from "src/ex-object/ExObject";
  // biome-ignore lint:
  import type MainContext from "src/main-context/MainContext";
  import SelectableView from "src/utils/utils/SelectableView.svelte";
  import ExprCommand from "src/utils/views/ExprCommand.svelte";
  import { onMount } from "svelte";
  import { ElementLayout } from "../layout/ElementLayout";
  import NodeView from "../layout/NodeView.svelte";

  export let ctx: MainContext;
  export let expr: Expr;
  export let elementLayout: ElementLayout;

  const exprCommandFocused$ = ctx.focusManager
    .getFocus$()
    .pipe(
      map((focus) => focus.type === "ExprReplaceCommand" && focus.expr === expr)
    );

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

  onMount(() => {
    const isSelected$ = ctx.focusManager.isSelected$(expr);
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
          ctx.focusManager.focusExprReplaceCommand(expr);
        }
      });

    return () => sub.unsubscribe();
  });

  let tooltipVisible = false;
  function handleMouseOver(event: MouseEvent) {
    event.stopPropagation();
    tooltipVisible = true;
  }

  function handleMouseLeave() {
    tooltipVisible = false;
  }
</script>

<NodeView {elementLayout} elementKey={expr.id}>
  <SelectableView {ctx} object={expr}>
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <!-- svelte-ignore a11y-mouse-events-have-key-events -->
    <div
      class="rounded-sm card card-compact card-bordered p-2 container bg-base-100"
      style="min-width: 24px;"
      on:mouseover={handleMouseOver}
      on:mouseleave={handleMouseLeave}
    >
      <span
        class="absolute w-max rounded-sm pointer-events-none border-base-200 border bg-base-100 top-0 left-full ml-2 tooltip p-2 z-10"
        class:invisible={!tooltipVisible}>Expr {expr.ordinal}</span
      >
      <span>{getText()}</span>

      {#if $exprCommandFocused$}
        <ExprCommand {ctx} {expr} />
      {/if}

      <div class="pl-2">
        {#each $args$ as arg (arg.id)}
          <svelte:self expr={arg} {ctx} {elementLayout} />
        {/each}
      </div>
    </div>
  </SelectableView>
</NodeView>

<style>
</style>
