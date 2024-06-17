<script lang="ts">
  import { onMount } from "svelte";
  import DebugOverlaySetup from "./DebugOverlaySetup";
  import DebugOverlayUtils from "./DebugOverlayUtils";
  import DebugOverlay, { type FormattedMessage } from "./DebugOverlay";
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

  let messages: FormattedMessage[] = [];
  DebugOverlayUtils.getFilteredMessages$(query$).subscribe((v) => {
    messages = v;
  });

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
  {#if messages}
    {#each messages as message}
      <DebugOverlayMessage {message} {ctx} />
    {/each}
  {/if}
</main>
