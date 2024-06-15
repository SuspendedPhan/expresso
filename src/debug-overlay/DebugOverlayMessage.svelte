<script lang="ts">
  import { map } from "rxjs";
  import type { FormattedMessage } from "./DebugOverlay";
  import DebugOverlayContext from "./DebugOverlayContext";

  export let message: FormattedMessage;
  export let ctx: DebugOverlayContext;

  const selected$ = ctx.selection.getSelected$().pipe(
    map((selected) => {
      if (selected === null) {
        return false;
      }
      return selected.message.id === message.message.id;
    })
  );
</script>

<div class="border" class:border={$selected$}>
  {message.text}
</div>
