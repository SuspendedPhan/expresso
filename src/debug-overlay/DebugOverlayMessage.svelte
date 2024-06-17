<script lang="ts">
  import { map, of } from "rxjs";
  import type { FormattedMessage } from "./DebugOverlay";
  import DebugOverlayContext from "./DebugOverlayContext";
  import DebugOverlaySelectable from "./DebugOverlaySelectable.svelte";

  export let message: FormattedMessage;
  export let ctx: DebugOverlayContext;

  const selected$ = ctx.selection.getCurrent$().pipe(
    map((selected) => {
      if (selected === null) {
        return false;
      }
      return selected.message.id === message.message.id;
    })
  );
</script>

<DebugOverlaySelectable {selected$}>
  {message.text}
</DebugOverlaySelectable>
