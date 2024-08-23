<script lang="ts">
  import { onMount } from "svelte";
  import { BehaviorSubject, firstValueFrom, of } from "rxjs";
  import MainContext from "src/main-context/MainContext";
  import type { Expr } from "src/ex-object/ExItem";
  import Divider from "src/utils/views/Divider.svelte";

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
    {#each $cmds$ as cmd}
      <div>
        <button on:click={cmd.execute}>{cmd.label}</button>
      </div>
    {/each}
  </div>
</div>
