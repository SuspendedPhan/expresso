<script lang="ts">
  import type { CommandCardData } from "src/utils/utils/CommandCard";
  import FocusView from "src/utils/views/FocusView.svelte";

  export let data: CommandCardData;
  console.log("CommandCard", data);
  const visible$ = data.visible$;

  visible$.subscribe((v) => {
    console.log("visible", v);
  });
</script>

{#if $visible$}
  <div
    class="fixed left-0 right-0 flex justify-center items-center pointer-events-none"
    style:top="10vh"
  >
    <FocusView focused={true} class="ex-card p-4 min-w-96">
      <div class="mb-4">{data.title}</div>
      {#each data.commands as command}
        <div>{command}</div>
      {/each}
    </FocusView>
  </div>
{/if}
