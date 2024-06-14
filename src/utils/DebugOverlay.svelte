<script lang="ts">
  import { onMount } from "svelte";
  import Logger, { type Message } from "./Logger";
  import { BehaviorSubject, combineLatest, map, mergeMap } from "rxjs";
  import DebugOverlaySetup from "./DebugOverlaySetup";

  let overlay;
  let input;
  const query$ = new BehaviorSubject<string>("");

  onMount(() => {
    DebugOverlaySetup.setup(overlay, input);
  });

  function formatMessage(m: Message): string {
    // Concat all the args.

    const args = m.args
      .map((a) => {
        if (a === null) {
          return "null";
        }
        return a.toString();
      })
      .join(" ");
    return `${m.topic} ${m.key} ${args}`;
  }

  const messages$ = Logger.getMessages$().pipe(
    map((messages) => {
      // Format all the messages and join them with a newline.
      return messages.map(formatMessage);
    })
  );

  const filteredMessages$ = combineLatest([messages$, query$]).pipe(
    map(([messages, query]) => {
      // Filter the messages based on the query.
      if (query === "") {
        return messages;
      }

      return messages.filter((m) =>
        m.toLowerCase().includes(query.toLowerCase())
      );
    })
  );

  function handleInput(
    event: Event & { currentTarget: EventTarget & HTMLInputElement }
  ) {
    query$.next(event.currentTarget.value);
  }
</script>

<main bind:this={overlay} class="text-left">
  <div>Logs</div>
  <input type="text" bind:this={input} on:input={handleInput} />
  {#each $filteredMessages$ as message}
    <div>{message}</div>
  {/each}
</main>
