<script lang="ts">
  import { onMount } from "svelte";
  import Logger, { type Message } from "./Logger";
  import { BehaviorSubject, combineLatest, map, mergeMap } from "rxjs";
  import DebugOverlaySetup from "./DebugOverlaySetup";
  import DebugOverlayUtils from "./DebugOverlayUtils";
  import DebugOverlay from "./DebugOverlay";
  import DebugOverlayKeyboard from "./DebugOverlayKeyboard";

  let overlay;
  let input;
  const query$ = new BehaviorSubject<string>("");

  const debugOverlay = new DebugOverlay();
  DebugOverlayKeyboard.register(debugOverlay);

  onMount(() => {
    DebugOverlaySetup.setup(overlay, input, debugOverlay);
  });

  const filteredMessages$ = DebugOverlayUtils.getFilteredMessages$(query$);

  function handleInput(
    event: Event & { currentTarget: EventTarget & HTMLInputElement }
  ) {
    query$.next(event.currentTarget.value);
  }

  function handleKeydown(
    event: KeyboardEvent & { currentTarget: EventTarget & HTMLElement }
  ) {
    if (event.key === "/" && event.metaKey) {
      input.blur();
      debugOverlay.toggleActive();
    }
  }
</script>

<main bind:this={overlay} class="text-left" on:keydown={handleKeydown}>
  <div>Logs</div>
  <input type="text" bind:this={input} on:input={handleInput} />
  {#each $filteredMessages$ as message}
    <div>{message}</div>
  {/each}
</main>
