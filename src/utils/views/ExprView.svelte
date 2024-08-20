<script lang="ts">
  import { map, of, type Observable } from "rxjs";
  import { ExprType, type Expr } from "src/ex-object/ExItem";
  import type MainContext from "src/main-context/MainContext";
  import { FocusKind } from "src/utils/focus/FocusKind";
  import ExprCommand from "src/utils/views/ExprCommand.svelte";
  import FocusView from "src/utils/views/FocusView.svelte";
  import type { ElementLayout } from "../layout/ElementLayout";
  import NodeView from "../layout/NodeView.svelte";

  export let ctx: MainContext;
  export let expr: Expr;
  export let elementLayout: ElementLayout;

  const exprCommandFocused$ = ctx.focusCtx.focus$.pipe(
    map((focus) => {
      if (!FocusKind.is.Expr(focus) || focus.expr !== expr) {
        return false;
      }
      return focus.isEditing;
    })
  );

  const exprFocused$ = ctx.focusCtx.exprFocusCtx.exprFocused$(expr);

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

  let tooltipVisible = false;
  function handleMouseOver(event: MouseEvent) {
    event.stopPropagation();
    tooltipVisible = true;
  }

  function handleMouseLeave() {
    tooltipVisible = false;
  }

  function handleMousedown() {
    ctx.focusCtx.setFocus(FocusKind.Expr({ expr, isEditing: false }));
  }
</script>

<NodeView {elementLayout} elementKey={expr.id}>
  <FocusView focused={$exprFocused$} on:mousedown={handleMousedown}>
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <!-- svelte-ignore a11y-mouse-events-have-key-events -->
    <div
      class="rounded-sm card card-compact card-bordered px-2 container bg-base-100 font-mono"
      on:mouseover={handleMouseOver}
      on:mouseleave={handleMouseLeave}
    >
      {#if tooltipVisible}
        <span
          class="absolute w-max rounded-sm pointer-events-none border-base-200 border bg-base-100 top-0 left-full ml-2 tooltip p-2 z-10"
          >Expr {expr.ordinal}</span
        >
      {/if}
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
  </FocusView>
</NodeView>

<style>
</style>
