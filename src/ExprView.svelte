<script lang="ts">
  import {
    BehaviorSubject,
    Observable,
    combineLatest,
    combineLatestAll,
    concat,
    concatAll,
    map,
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

  export let expr$: Observable<Expr>;
  // Logger.debug("ExprView", expr);
  // Logger.log("ExprView", expr);

  expr$.subscribe(new BehaviorSubject<Expr>(new NumberExpr(0)));

  const args$ = expr$.pipe(
    map((v) => {
      if (v instanceof CallExpr) {
        return v.getArgs$();
      }
      return of([]);
    }),
    concatAll()
  );

  expr$.subscribe((v) => Logger.topic("ExprView").debug("expr$", v));
  args$.subscribe((v) => Logger.topic("ExprView").debug("args$", v));

  const text$ = expr$.pipe(map((v) => v.getText()));

  const handleSelect$ = expr$.pipe(
    map((v) => {
      return (event: CustomEvent<Expr>) => {
        Logger.log("handleSelect", event.detail);

        v.replace(event.detail);
      };
    })
  );

  // function handleSelect(event: CustomEvent<Expr>) {
  //   Logger.log("handleSelect", event.detail);

  //   expr.replace(event.detail);
  // }
  onMount(() => {
    Logger.topic("ExprView").debug("onMount");
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
