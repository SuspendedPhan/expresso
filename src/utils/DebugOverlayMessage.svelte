<script lang="ts">
  import { map } from "rxjs";
  import type { FormattedMessage } from "./DebugOverlay";
  import DebugOverlayContext from "./DebugOverlayContext";

  export let message: FormattedMessage;
  export let ctx: DebugOverlayContext;

  const selected$ = ctx.selection
    .getSelected$()
    .pipe(map((selected) => selected === message));
</script>

<div class:border={$selected$}>
  {message.text}
</div>
