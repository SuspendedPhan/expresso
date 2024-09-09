<script lang="ts">
  import CommandCard from "src/utils/utils/CommandCard.svelte";

  const commandCards$ = ctx.viewCtx.commandCardCtx.commandCards$;
</script>

{#each $commandCards$ as commandCard}
  <CommandCard data={commandCard} />
{/each}
