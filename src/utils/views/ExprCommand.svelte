<script lang="ts">
  import { onMount } from "svelte";
  import { BehaviorSubject, firstValueFrom, of } from "rxjs";
  import MainContext from "src/main-context/MainContext";
  import type { Expr } from "src/ex-object/ExItem";

  export let expr: Expr;
  export let ctx: MainContext;

  let input: HTMLInputElement;

  onMount(() => {
    const sub = ctx.eventBus.submitExprReplaceCommand$.subscribe(async () => {
      const text = input.value;
      const cmds$ = await ctx.exprCommandCtx.getReplacementCommands$Prom(
        expr,
        of(text)
      );

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

  let query$ = new BehaviorSubject<string>("");
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

<div class="absolute top-full left-0 mt-2 p-2 bg-white ring rounded-sm">
  <input
    class="outline-none"
    type="text"
    value={$query$}
    on:input={handleInput}
    bind:this={input}
  />
</div>
