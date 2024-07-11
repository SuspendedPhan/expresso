<script lang="ts">
  import {
    BehaviorSubject,
    combineLatest,
    interval,
    map,
    of,
    startWith,
    switchMap,
  } from "rxjs";
  import GoModuleLoader from "./utils/GoModuleLoader";
  // import { Attribute } from "./Domain";
  import AttributeView from "./AttributeView.svelte";
  import Logger from "./utils/Logger";
  import MainContext from "./MainContext";
  import Dehydrator from "./hydration/Dehydrator";
  import Rehydrator from "./hydration/Rehydrator";
  import Main from "./utils/Main";
  import { type ReadonlyAttribute } from "./Domain";
  import type { Attribute, Attribute, AttributeMut } from "./ExprFactory";

  const logger = Logger.file("MainView.svelte");

  let ctx: MainContext | null = null;
  let attribute$: BehaviorSubject<Attribute> | null = null;
  // let rehydratedAttribute = null;
  let result = -1;

  async function setup() {
    const main = await Main.setup();
    ctx = main.ctx;
    attribute$ = new BehaviorSubject(main.attribute);

    new Dehydrator()
      .dehydrateAttribute$(main.attribute)
      .subscribe((dehydratedAttribute) => {
        console.log(
          "dehydratedAttribute",
          JSON.stringify(dehydratedAttribute, null, 6)
        );
      });

    // Dehydrator.dehydrateAttribute$(attribute).subscribe(
    //   (dehydratedAttribute) => {
    //     rehydratedAttribute =
    //       Rehydrator.rehydrateAttribute(dehydratedAttribute);
    //     logger.log("dehydratedAttribute", dehydratedAttribute.toString());
    //     logger.log("rehydratedAttribute", rehydratedAttribute.toString());
    //   }
    // );

    const expr$ = attribute$.pipe(switchMap((a) => a.expr$));

    combineLatest([interval(1000), expr$]).subscribe(([_, expr]) => {
      result = ctx!.goModule.evalExpr(expr.id);
    });
  }

  setup();

  document.addEventListener("mousedown", () => {
    ctx?.selection.selectedObject$.next(null);
  });
</script>

<main>
  <div>Hello World</div>
  <div>{result}</div>

  {#if ctx === null || attribute$ === null}
    <div>Loading...</div>
  {:else}
    <div>Loaded</div>
    <AttributeView {ctx} {attribute$} />
    <!-- {#key rehydratedAttribute}
      <AttributeView {ctx} attribute={rehydratedAttribute} />
    {/key} -->
  {/if}
</main>

<style></style>
