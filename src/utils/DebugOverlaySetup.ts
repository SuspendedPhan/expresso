import { onMount } from "svelte";

export default class DebugOverlaySetup {
  public static setup(overlay: HTMLElement, input: HTMLInputElement) {
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
  }
}
