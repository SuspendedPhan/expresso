<script lang="ts">
  import { createEventDispatcher } from "svelte";
  // import { NumberExpr, PrimitiveFunctionCallExpr, type Expr } from "./Domain";
  import { BehaviorSubject } from "rxjs";
  const dispatch = createEventDispatcher<{ select: string }>();

  let input: HTMLInputElement;
  let displayClass = "hidden";

  export function startEditing(key: string) {
    displayClass = "";
    input.focus();
    input.value = key;
  }

  function handleKeydown(
    event: KeyboardEvent & { currentTarget: HTMLInputElement }
  ) {
    if (event.key === "Enter") {
      dispatch("select", event.currentTarget.value);
    }
  }

  let query$ = new BehaviorSubject<string>("");
  function handleInput(
    event: Event & { currentTarget: EventTarget & HTMLInputElement }
  ) {
    query$.next(event.currentTarget.value);
  }
</script>

<div
  class="card absolute top-full left-0 mt-2 p-2 bg-white {displayClass} border border-solid border-black"
>
  <input
    type="text"
    value={$query$}
    on:input={handleInput}
    on:keydown={handleKeydown}
    bind:this={input}
  />
</div>
