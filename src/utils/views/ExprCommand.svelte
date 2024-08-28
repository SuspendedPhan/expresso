<script lang="ts">
  import {
    BehaviorSubject,
    combineLatest,
    firstValueFrom,
    map,
    switchMap,
  } from "rxjs";
  import type { Expr } from "src/ex-object/ExItem";
  import MainContext from "src/main-context/MainContext";
  import {
    ArrayFns,
    createBehaviorSubjectWithLifetime,
    RxFns,
  } from "src/utils/utils/Utils";
  import Divider from "src/utils/views/Divider.svelte";
  import { onMount } from "svelte";

  export let expr: Expr;
  export let ctx: MainContext;

  let input: HTMLInputElement;

  onMount(() => {
    const sub = ctx.eventBus.submitExprReplaceCommand$.subscribe(async () => {
      const cmd = await firstValueFrom(selectedCmd$);
      if (cmd) {
        cmd.execute();
      }
    });

    return () => {
      sub.unsubscribe();
    };
  });

  const query$ = new BehaviorSubject<string>("");
  const cmds$ = RxFns.onMount$().pipe(
    switchMap(() => ctx.exprCommandCtx.getReplacementCommands$(expr, query$))
  );

  const selectedIndex$ = createBehaviorSubjectWithLifetime<number | null>(
    RxFns.onMount$(),
    null
  );

  const selectedCmd$ = combineLatest([cmds$, selectedIndex$]).pipe(
    map(([cmds, selectedIndex]) => {
      if (selectedIndex === null) {
        return null;
      }
      return cmds[selectedIndex];
    })
  );

  cmds$.subscribe((cmds) => {
    if (cmds.length > 0 && selectedIndex$.value === null) {
      selectedIndex$.next(0);
    }
  });

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

  async function handleKeydown(event: KeyboardEvent) {
    const selectedIndex = selectedIndex$.value;
    if (selectedIndex === null) {
      return;
    }

    const cmds = await firstValueFrom(cmds$);

    if (event.key === "ArrowDown") {
      event.preventDefault();
      const index = ArrayFns.getWrappedIndex(cmds, selectedIndex + 1);
      selectedIndex$.next(index);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      const index = ArrayFns.getWrappedIndex(cmds, selectedIndex - 1);
      selectedIndex$.next(index);
    }
  }
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
      on:keydown={handleKeydown}
    />
  </div>
  <Divider />
  <div>
    {#if $cmds$}
      {#each $cmds$ as cmd}
        <div class:bg-neutral-content={cmd === $selectedCmd$}>
          <button on:click={cmd.execute}>{cmd.label}</button>
        </div>
      {/each}
    {/if}
  </div>
</div>
