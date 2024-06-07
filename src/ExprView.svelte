<script lang="ts">
  import {
    BehaviorSubject,
    Observable,
    combineLatest,
    combineLatestAll,
    concat,
    concatAll,
    concatMap,
    map,
    mergeMap,
    of,
    subscribeOn,
    tap,
  } from "rxjs";
  import {
    CallExpr,
    NumberExpr,
    PrimitiveFunctionCallExpr,
    type Expr,
  } from "./Domain";
  import ExprCommand from "./ExprCommand.svelte";
  import Logger from "./Logger";
  import { onMount } from "svelte";

  Logger.allow("ExprView");

  export let expr$: Observable<Expr>;

  const args$ = expr$.pipe(
    mergeMap((v) => {
      Logger.topic("ExprView").log("v", v);
      if (v instanceof CallExpr) {
        Logger.topic("ExprView").log("v.getArgs$()", v.getArgs$());
        return v.getArgs$();
      }
      Logger.topic("ExprView").log("return of([])");
      return of([]);
    })
  );

  expr$.subscribe((v) => Logger.topic("ExprView").log("expr$", v));
  args$.subscribe((v) => Logger.topic("ExprView").log("args$", v));

  const text$ = expr$.pipe(map((v) => v.getText()));

  const handleSelect$ = expr$.pipe(
    map((v) => {
      return (event: CustomEvent<Expr>) => {
        Logger.debug("handleSelect", event.detail);

        v.replace(event.detail);
      };
    })
  );

  onMount(() => {
    Logger.topic("ExprView").log("onMount");
  });
</script>

<main>
  <span>Expr</span>
  <span>{$text$}</span>
  <ExprCommand on:select={$handleSelect$} />

  <div class="pl-2">
    {#each $args$ as arg}
      <svelte:self expr$={of(arg)} />
    {/each}
  </div>
</main>
