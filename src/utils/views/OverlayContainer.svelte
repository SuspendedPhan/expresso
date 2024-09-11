<script lang="ts">
  import { Effect } from "effect";
  import {
    CommandCardCtx,
    type CommandCardData,
  } from "src/utils/utils/CommandCard";
  import CommandCard from "src/utils/utils/CommandCard.svelte";
  import { DexRuntime } from "src/utils/utils/DexRuntime";
  import type { OBS } from "src/utils/utils/Utils";

  let commandCards$: OBS<CommandCardData[]>;
  DexRuntime.runPromise(
    Effect.gen(function* () {
      commandCards$ = yield* CommandCardCtx.commandCards$;
    })
  );
</script>

{#if commandCards$ !== undefined}
  {#each $commandCards$ as commandCard}
    <CommandCard data={commandCard} />
  {/each}
{/if}
