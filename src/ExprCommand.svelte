<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { NumberExpr } from "./Domain";
  const dispatch = createEventDispatcher();

  function handleKeydown(
    event: KeyboardEvent & { currentTarget: HTMLInputElement }
  ) {
    if (event.key === "Enter") {
      const value = parseFloat(event.currentTarget.value);
      if (isNaN(value)) return;

      const expr = new NumberExpr(value);
      dispatch("select", expr);
    }
  }
</script>

<main>
  <input type="number" on:keydown={handleKeydown} />
</main>
