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

  const borderClass$ = selected$.pipe(
    map((selected) => {
      if (selected) {
        return "border-solid";
      } else {
        return "border-transparent";
      }
    })
  );
</script>

<div class="border {$borderClass$}">
  {message.text}
</div>
