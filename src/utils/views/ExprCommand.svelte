<script lang="ts">
  import { onMount } from "svelte";
  import { BehaviorSubject, firstValueFrom, of } from "rxjs";
  import MainContext from "src/main-context/MainContext";
  import type { Expr } from "src/ex-object/ExItem";
  import Divider from "src/utils/views/Divider.svelte";
  import type { ExprCommand } from "src/utils/utils/ExprCommand";

  export let expr: Expr;
  export let ctx: MainContext;

  let input: HTMLInputElement;

  onMount(() => {
    const sub = ctx.eventBus.submitExprReplaceCommand$.subscribe(async () => {
      const text = input.value;
      const cmds$ = ctx.exprCommandCtx.getReplacementCommands$(expr, of(text));

      const cmds = await firstValueFrom(cmds$);
      const cmd = cmds[0];
      if (cmd) {
        cmd.execute();
      }
    });

    return () => {
      sub.unsubscribe();
    };
  });

  const query$ = new BehaviorSubject<string>("");
  const cmds$ = ctx.exprCommandCtx.getReplacementCommands$(expr, query$);
  const selectedCmd$ = new BehaviorSubject<ExprCommand | null>(null);

  function handleInput(
    event: Event & { currentTarget: EventTarget & HTMLInputElement }
  ) {
    query$.next(event.currentTarget.value);
  }

  onMount(() => {
    setTimeout(() => {
      input.focus();
    }, 0);
  });
</script>

<div
  class="absolute top-full left-0 mt-2 p-2 bg-white ring rounded-sm flex flex-col gap-2"
>
  <div>
    <input
      class="outline-none"
      type="text"
      value={$query$}
      on:input={handleInput}
      bind:this={input}
    />
  </div>
  <Divider />
  <div>
    {#if $cmds$}
      {#each $cmds$ as cmd}
        <div class="bg-neutral-content">
          <button on:click={cmd.execute}>{cmd.label}</button>
        </div>
      {/each}
    {/if}
  </div>
</div>
