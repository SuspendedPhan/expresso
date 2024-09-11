<script lang="ts">
  import { DexRuntime } from "src/utils/utils/DexRuntime";
  import KbdShortcutSpan from "./KbdShortcutSpan.svelte";
  import { map, of } from "rxjs";
  import { Effect } from "effect";
  import { ViewCtx } from "src/ctx/ViewCtx";
  import type { NavItem } from "../utils/Nav";
  import type { OBS } from "src/utils/utils/Utils";

  export let item: NavItem;

  let isActive$: OBS<boolean>;
  let sectionFocused$: OBS<boolean> = of(false);

  DexRuntime.runPromise(
    Effect.gen(function* () {
      isActive$ = (yield* ViewCtx.activeWindow$).pipe(
        map((w) => w === item.window)
      );
      // sectionFocused$ = (yield* ViewCtx.navFocusCtx).sectionFocused$(
      //   item.section
      // );
    })
  );

  function handleClick() {
    DexRuntime.runPromise(
      Effect.gen(function* () {
        const activeWindow$ = yield* ViewCtx.activeWindow$;
        activeWindow$.next(item.window);
      })
    );
  }
</script>

<button
  class:active={$isActive$}
  class="block focus:bg-transparent"
  on:click={handleClick}
>
  <KbdShortcutSpan label={item.label} showShortcut={$sectionFocused$} />
</button>
