<script lang="ts">
  import type { CommandCardData } from "src/utils/utils/CommandCard";

  export let data: CommandCardData;
  const visible$ = data.visible$;
</script>

{#if $visible$}
  <div
    class="fixed left-0 top-0 right-0 bottom-0 flex justify-center items-center pointer-events-none"
  >
    <div class="ex-card p-4 min-w-96">
      <div class="mb-4">{data.title}</div>
      {#each data.commands as command}
        <div>{command}</div>
      {/each}
    </div>
  </div>
{/if}
