<script lang="ts">
  import {
    BehaviorSubject,
    combineLatest,
    interval,
    Observable,
    switchMap,
  } from "rxjs";
  import AttributeView from "./AttributeView.svelte";
  import MainContext from "./MainContext";
  import Main from "./utils/Main";
  import type { Attribute } from "./ExprFactory";
  import HydrationTest from "./utils/HydrationTest";
  import { loggedMethod } from "./logger/LoggerDecorator";
  import Logger from "./logger/Logger";

  let ctx: MainContext | null = null;
  let attribute$: Observable<Attribute> | null = null;
  let rehydratedAttribute$: BehaviorSubject<Attribute> | null = null;
  let result = -1;

  const main$ = Main.setup$();
  main$.subscribe((main) => MainView.setup(main));

  class MainView {
    @loggedMethod
    static setup(main: Main) {
      const logger = Logger.logger();

      ctx = main.ctx;
      attribute$ = main.attribute$;
      const expr$ = attribute$.pipe(switchMap((a) => a.expr$));

      HydrationTest.test(main, ctx).subscribe((a) => {
        if (a === null) {
          return;
        }

        logger.log("Main.subscribe", a.id);
        if (rehydratedAttribute$ === null) {
          logger.log("Main.subscribe", "create rehydratedAttribute$");
          rehydratedAttribute$ = new BehaviorSubject(a);
        }
        rehydratedAttribute$.next(a);
      });

      combineLatest([interval(1000), expr$]).subscribe(([_, expr]) => {
        result = ctx!.goModule.evalExpr(expr.id);
      });
    }
  }

  document.addEventListener("mousedown", () => {
    ctx?.selection.select(null);
  });
</script>

<main>
  <div>Hello World</div>
  <div>{result}</div>

  {#if ctx === null || attribute$ === null || rehydratedAttribute$ === null}
    <div>Loading...</div>
  {:else}
    <div>Loaded</div>
    <AttributeView {ctx} {attribute$} />
    <AttributeView {ctx} attribute$={rehydratedAttribute$} />
  {/if}
</main>

<style></style>
