<script lang="ts">
  import { onMount } from "svelte";

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
</script>

<main bind:this={overlay}>
  <div>Hello World</div>
  <input type="text" bind:this={input} />
</main>
