<script lang="ts">
  import type MainContext from "src/main-context/MainContext";
  import CommandCard from "src/utils/utils/CommandCard.svelte";

  export let ctx: MainContext;
  const commandCards$ = ctx.viewCtx.commandCardCtx.commandCards$;
</script>

{#each $commandCards$ as commandCard}
  <CommandCard data={commandCard} />
{/each}
