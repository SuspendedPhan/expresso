<script lang="ts">
  import { onMount } from "svelte";
  import DebugOverlaySetup from "./DebugOverlaySetup";
  import DebugOverlayUtils from "./DebugOverlayUtils";
  import DebugOverlay from "./DebugOverlay";
  import DebugOverlayKeyboard from "./DebugOverlayKeyboard";
  import DebugOverlayMessage from "./DebugOverlayMessage.svelte";
  import DebugOverlayContext from "./DebugOverlayContext";
  import LoggerConfigView from "./LoggerConfigView.svelte";

  let overlay: HTMLElement;
  let input: HTMLInputElement;

  const debugOverlay = new DebugOverlay();
  const ctx = new DebugOverlayContext(debugOverlay);
  const query$ = debugOverlay.getQuery$();

  onMount(() => {
    DebugOverlayKeyboard.register(ctx, input);
    DebugOverlaySetup.setup(overlay, debugOverlay);
  });

  const messages$ = DebugOverlayUtils.getFilteredMessages$(query$);

  function handleInput(
    event: Event & { currentTarget: EventTarget & HTMLInputElement }
  ) {
    debugOverlay.setQuery(event.currentTarget.value);
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
  <LoggerConfigView />
  <input
    type="text"
    bind:this={input}
    on:input={handleInput}
    on:keydown={handleKeydown}
    class="border"
  />
  {#each $messages$ as message}
    <DebugOverlayMessage {message} {ctx} />
  {/each}
</main>
