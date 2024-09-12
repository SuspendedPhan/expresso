<script lang="ts">
  import assert from "assert-ts";
  import { Effect } from "effect";
  import {
    BehaviorSubject,
    combineLatest,
    firstValueFrom,
    map,
    mergeAll,
    shareReplay,
    switchAll,
    switchMap,
  } from "rxjs";
  import type { Expr } from "src/ex-object/Expr";
  import { DexRuntime } from "src/utils/utils/DexRuntime";
  import { ExprCommandCtx } from "src/utils/utils/ExprCommand";

  import { log5 } from "src/utils/utils/Log5";
  import {
    ArrayFns,
    createBehaviorSubjectWithLifetime,
    RxFns,
  } from "src/utils/utils/Utils";
  import Divider from "src/utils/views/Divider.svelte";
  import { onMount } from "svelte";

  const log55 = log5("ExprCommand.svelte");

  export let expr: Expr;

  let input: HTMLInputElement;

  RxFns.onMount$()
    .pipe(
      switchMap(() => {
        log55.debug("onMount");
        return DexRuntime.runPromise(ExprCommandCtx.onSubmitExprCommand$);
      }),
      switchAll()
    )
    .subscribe(async () => {
      log55.debug("onSubmitExprCommand");
      const cmd = await firstValueFrom(selectedCmd$);
      if (cmd) {
        log55.debug("onSubmitExprCommand.cmd", cmd);
        DexRuntime.runPromise(
          Effect.gen(function* () {
            yield* cmd.execute();
          })
        );
      }
    });

  const query$ = new BehaviorSubject<string>("");
  const cmds$ = RxFns.onMount$().pipe(
    switchMap(async () => {
      const result = DexRuntime.runPromise(
        Effect.gen(function* () {
          const commands = yield* ExprCommandCtx.getReplacementCommands$(
            expr,
            query$
          );
          return commands;
        })
      );
      return await result;
    }),
    mergeAll(),
    shareReplay(1)
  );

  const selectedIndex$ = createBehaviorSubjectWithLifetime<number | null>(
    RxFns.onMount$(),
    null
  );

  const selectedCmd$ = combineLatest([cmds$, selectedIndex$]).pipe(
    map(([cmds, selectedIndex]) => {
      if (selectedIndex !== null) {
        const cmd = cmds[selectedIndex];
        assert(cmd !== undefined);
        return cmd;
      }
      return null;
    })
  );

  cmds$.subscribe((cmds) => {
    log55.debug("cmds", cmds);
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
    log55.debug("handleKeydown", event.key, selectedIndex);
    const cmds = await firstValueFrom(cmds$);
    log55.debug("handleKeyDown.cmds", cmds);

    if (event.key === "ArrowDown") {
      log55.debug("ArrowDown");
      event.preventDefault();
      let index = 0;
      if (selectedIndex !== null) {
        log55.debug("selectedIndex", selectedIndex);
        index = ArrayFns.getWrappedIndex(cmds, selectedIndex + 1);
      }
      log55.debug("index", index);
      selectedIndex$.next(index);
    } else if (event.key === "ArrowUp") {
      log55.debug("ArrowUp");
      event.preventDefault();
      let index = cmds.length - 1;
      if (selectedIndex !== null) {
        index = ArrayFns.getWrappedIndex(cmds, selectedIndex - 1);
      }
      selectedIndex$.next(index);
    } else if (event.key === "Enter") {
      log55.debug("Enter");
      event.preventDefault();
      DexRuntime.runPromise(
        Effect.gen(function* () {
          log55.debug("handleKeydown.onSubmitExprCommand");
          (yield* ExprCommandCtx.onSubmitExprCommand$).next();
        })
      );
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
