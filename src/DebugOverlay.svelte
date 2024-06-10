<script lang="ts">
  import { onMount } from "svelte";
  import Logger, { type Message } from "./Logger";
  import { map, mergeMap } from "rxjs";

  let overlay;
  let input;

  onMount(() => {
    overlay.style.display = `none`;
    overlay.style.position = `fixed`;
    overlay.style.top = `0`;
    overlay.style.left = `0`;
    overlay.style.width = `100%`;
    overlay.style.height = `100%`;
    overlay.style.backgroundColor = `white`;
    overlay.style.color = `black`;
    overlay.style.zIndex = `9999`;
    overlay.style.padding = `20px`;
    overlay.style.boxSizing = `border-box`;
    overlay.style.fontSize = `16px`;
    overlay.style.lineHeight = `2`;
    overlay.style.overflow = `auto`;
    // overlay.style.fontFamily = `monospace`;
    document.addEventListener("keydown", (e) => {
      if (e.key === "/") {
        e.preventDefault();
        if (overlay.style.display === "none") {
          overlay.style.display = "block";
          setTimeout(() => input.focus(), 0);
        } else {
          overlay.style.display = "none";
        }
      }
    });
  });

  function formatMessage(m: Message): string {
    // Concat all the args.
    const args = m.args.map((a) => a.toString()).join(" ");
    return `${m.topic} ${args}`;
  }

  Logger.allowAll();
  const messages$ = Logger.getMessages$().pipe(
    map((messages) => {
      // Format all the messages and join them with a newline.
      return messages.map(formatMessage);
    })
  );
</script>

<main bind:this={overlay}>
  <div>Logs</div>
  <input type="text" bind:this={input} />
  {#each $messages$ as message (message)}
    <div>{message}</div>
  {/each}
</main>
