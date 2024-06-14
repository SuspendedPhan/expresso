<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { NumberExpr, PrimitiveFunctionCallExpr, type Expr } from "./Domain";
  import { BehaviorSubject } from "rxjs";
  import Logger from "./utils/Logger";
  import type MainContext from "./MainContext";

  export let ctx: MainContext;

  const dispatch = createEventDispatcher<{ select: Expr }>();

  function handleKeydown(
    event: KeyboardEvent & { currentTarget: HTMLInputElement }
  ) {
    if (event.key === "Enter") {
      const expr = textToExpr(event.currentTarget.value);
      if (expr !== null) {
        query$.next("");
        dispatch("select", expr);
      }
    }
  }

  function textToExpr(text: string): Expr | null {
    const value = parseFloat(text);
    if (!isNaN(value)) {
      return ctx.createNumberExpr(value);
    }
    if (text === "+") {
      return ctx.createPrimitiveFunctionCallExpr([
        ctx.createNumberExpr(0),
        ctx.createNumberExpr(0),
      ]);
    }
    return null;
  }

  let query$ = new BehaviorSubject<string>("");
  query$.subscribe((v) => Logger.file("ExprCommand").log("query$", v));

  function handleInput(
    event: Event & { currentTarget: EventTarget & HTMLInputElement }
  ) {
    query$.next(event.currentTarget.value);
  }
</script>

<main>
  <input
    type="text"
    value={$query$}
    on:input={handleInput}
    on:keydown={handleKeydown}
    class="border border-solid border-black"
  />
</main>
