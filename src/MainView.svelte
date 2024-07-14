<script lang="ts">
  import { BehaviorSubject, combineLatest, interval, switchMap } from "rxjs";
  import AttributeView from "./AttributeView.svelte";
  import MainContext from "./MainContext";
  import Main from "./utils/Main";
  import type { Attribute } from "./ExprFactory";
  import HydrationTest from "./utils/HydrationTest";
  import { loggedMethod } from "./logger/LoggerDecorator";

  let ctx: MainContext | null = null;
  let attribute$: BehaviorSubject<Attribute> | null = null;
  let rehydratedAttribute$: BehaviorSubject<Attribute> | null = null;
  let result = -1;

  class MainView {
    static async setupAsync() {
      const main = await Main.setup();
      this.setup(main);
    }

    @loggedMethod
    static setup(main: Main) {
      ctx = main.ctx;
      attribute$ = new BehaviorSubject(main.attribute);
      const expr$ = attribute$.pipe(switchMap((a) => a.expr$));

      HydrationTest.test(main, ctx).subscribe((a) => {
        if (a === null) {
          return;
        }

        console.log("Main.subscribe", a);
        if (rehydratedAttribute$ === null) {
          rehydratedAttribute$ = new BehaviorSubject(a);
        }
        rehydratedAttribute$.next(a);
      });

      combineLatest([interval(1000), expr$]).subscribe(([_, expr]) => {
        result = ctx!.goModule.evalExpr(expr.id);
      });
    }
  }

  MainView.setupAsync();

  document.addEventListener("mousedown", () => {
    ctx?.selection.selectedObject$.next(null);
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
