import { onMount } from "svelte";
import DebugOverlay from "./DebugOverlay";

export default class DebugOverlaySetup {
  public static setup(overlay: HTMLElement, input: HTMLInputElement, debugOverlay: DebugOverlay) {
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

    debugOverlay.isActive$().subscribe((active) => {
      if (active) {
        overlay.style.display = `block`;
      } else {
        overlay.style.display = `none`;
      }
    });
  }
}
