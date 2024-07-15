<script lang="ts">
  import { createEventDispatcher } from "svelte";
  // import { NumberExpr, PrimitiveFunctionCallExpr, type Expr } from "./Domain";
  import { BehaviorSubject } from "rxjs";
  import BakLogger from "./utils/BakLogger";
  const dispatch = createEventDispatcher<{ select: string }>();

  function handleKeydown(
    event: KeyboardEvent & { currentTarget: HTMLInputElement }
  ) {
    if (event.key === "Enter") {
      dispatch("select", event.currentTarget.value);
    }
  }

  let query$ = new BehaviorSubject<string>("");
  query$.subscribe((v) => BakLogger.file("ExprCommand").log("query$", v));

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
