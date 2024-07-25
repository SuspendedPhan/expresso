<script lang="ts">
  import { onMount, tick } from "svelte";
  // import { NumberExpr, PrimitiveFunctionCallExpr, type Expr } from "./Domain";
  import { BehaviorSubject } from "rxjs";
  import type { Expr } from "src/ex-object/ExObject";
  import MainContext from "src/main-context/MainContext";

  export let expr: Expr;
  export let ctx: MainContext;

  let input: HTMLInputElement;

  function handleKeydown(
    event: KeyboardEvent & { currentTarget: HTMLInputElement }
  ) {
    if (event.key === "Enter") {
      const text = input.value;
      const value = parseFloat(text);
      if (!isNaN(value)) {
        ctx.focusManager.focusExObject(expr);
        ctx.mutator.replaceWithNumberExpr(expr, value);
      } else if (text === "+") {
        ctx.focusManager.focusExObject(expr);
        ctx.mutator.replaceWithCallExpr(expr);
      }
    }
  }

  let query$ = new BehaviorSubject<string>("");
  function handleInput(
    event: Event & { currentTarget: EventTarget & HTMLInputElement }
  ) {
    query$.next(event.currentTarget.value);
  }

  onMount(() => {
    tick().then(() => {
      input.focus();
    });
    // input.focus();
  });
</script>

<div class="absolute top-full left-0 mt-2 p-2 bg-white ring rounded-sm">
  <input
    class="outline-none"
    type="text"
    value={$query$}
    on:input={handleInput}
    on:keydown={handleKeydown}
    bind:this={input}
  />
</div>
