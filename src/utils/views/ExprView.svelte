<script lang="ts">
  import { of, switchAll, switchMap, type Observable } from "rxjs";

  import assert from "assert-ts";
  import { ExFunc } from "src/ex-object/ExFunc";
  import { Expr, ExprFactory } from "src/ex-object/Expr";
  import { ExprFocusFactory } from "src/focus/ExprFocus";
  import { FocusCtx } from "src/focus/FocusCtx";
  import { DexRuntime } from "src/utils/utils/DexRuntime";
  import { log5 } from "src/utils/utils/Log5";
  import { RxFns } from "src/utils/utils/Utils";
  import ExprCommand from "src/utils/views/ExprSelect.svelte";
  import FocusView from "src/utils/views/FocusView.svelte";
  import { isType, matcher } from "variant";
  import type { ElementLayout } from "../layout/ElementLayout";
  import NodeView from "../layout/NodeView.svelte";
  import ExprSelect from "src/utils/views/ExprSelect.svelte";
  import Field from "./Field.svelte";

  const log55 = log5("ExprView.svelte");

  export let expr: Expr;
  export let elementLayout: ElementLayout;

  let exprFocused = false;
  let exprCommandFocused = false;
  RxFns.onMount$()
    .pipe(
      switchMap(() => DexRuntime.runPromise(FocusCtx.focus$)),
      switchAll()
    )
    .subscribe((focus) => {
      if (isType(focus, ExprFocusFactory.Expr) && focus.expr === expr) {
        exprFocused = focus.expr === expr;
        exprCommandFocused = focus.isEditing;
      } else {
        exprFocused = false;
        exprCommandFocused = false;
      }
    });

  let args$: Observable<readonly Expr[]>;
  if (isType(expr, ExprFactory.Call)) {
    args$ = expr.args$;
  } else {
    args$ = of([]);
  }

  RxFns.onMount$()
    .pipe(switchMap(() => args$))
    .subscribe((args) => {
      log55.debug("onMount.args", args);
    });

  const text$ = matcher(expr)
    .when(ExprFactory.Number, (number) => {
      return of(number.value.toString());
    })
    .when(ExprFactory.Call, (call) => {
      assert(call.exFunc$.value !== null);
      return ExFunc.name$(call.exFunc$.value);
    })
    .when(ExprFactory.Reference, (reference) => {
      assert(reference.target !== null);
      return Expr.getReferenceTargetName$(reference.target);
    })
    .complete();

  RxFns.onMount$()
    .pipe(switchMap(() => text$))
    .subscribe((text) => {
      log55.debug("onMount.text", text);
    });

  let tooltipVisible = false;
  function handleMouseOver(event: MouseEvent) {
    event.stopPropagation();
    tooltipVisible = true;
  }

  function handleMouseLeave() {
    tooltipVisible = false;
  }

  function handleMousedown() {
    DexRuntime.runPromise(
      FocusCtx.setFocus(ExprFocusFactory.Expr({ expr, isEditing: false }))
    );
  }
</script>

<NodeView {elementLayout} elementKey={expr.id}>
  <FocusView focused={exprFocused} on:mousedown={handleMousedown}>
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
      <span>{$text$}</span>

      <ExprSelect {expr} />

      <div class="pl-2">
        {#each $args$ as arg (arg.id)}
          <svelte:self expr={arg} {elementLayout} />
        {/each}
      </div>
    </div>
  </FocusView>
</NodeView>

<style>
</style>
