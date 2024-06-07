<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { NumberExpr, PrimitiveFunctionCallExpr, type Expr } from "./Domain";

  const dispatch = createEventDispatcher<{ select: Expr }>();

  function handleKeydown(
    event: KeyboardEvent & { currentTarget: HTMLInputElement }
  ) {
    if (event.key === "Enter") {
      const expr = textToExpr(event.currentTarget.value);
      if (expr !== null) {
        dispatch("select", expr);
      }
    }
  }

  function textToExpr(text: string): Expr | null {
    const value = parseFloat(text);
    if (!isNaN(value)) {
      return new NumberExpr(value);
    }
    if (text === "+") {
      return new PrimitiveFunctionCallExpr([
        new NumberExpr(0),
        new NumberExpr(0),
      ]);
    }
    return null;
  }
</script>

<main>
  <input
    type="text"
    on:keydown={handleKeydown}
    class="border border-solid border-black"
  />
</main>
