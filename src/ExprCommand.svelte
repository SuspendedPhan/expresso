<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { NumberExpr } from "./Domain";
  const dispatch = createEventDispatcher();

  const value = "32";

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
  <input type="number" {value} on:keydown={handleKeydown} />
</main>
