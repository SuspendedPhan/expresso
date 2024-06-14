<script lang="ts">
  import { onMount } from "svelte";
  import Logger, { type Message } from "./Logger";
  import { BehaviorSubject, combineLatest, map, mergeMap } from "rxjs";
  import DebugOverlaySetup from "./DebugOverlaySetup";
  import DebugOverlayUtils from "./DebugOverlayUtils";
  import DebugOverlay from "./DebugOverlay";
  import DebugOverlayKeyboard from "./DebugOverlayKeyboard";

  let overlay: HTMLElement;
  let input: HTMLInputElement;
  const query$ = new BehaviorSubject<string>("");

  const debugOverlay = new DebugOverlay();

  onMount(() => {
    DebugOverlayKeyboard.register(debugOverlay, input);
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
      debugOverlay.toggleActive();
    }
  }
</script>

<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<main bind:this={overlay} class="text-left">
  <div>Logs</div>
  <input
    type="text"
    bind:this={input}
    on:input={handleInput}
    on:keydown={handleKeydown}
  />
  {#each $filteredMessages$ as message}
    <div>{message}</div>
  {/each}
</main>
