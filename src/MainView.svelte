<script lang="ts">
  import { combineLatest, interval, map, of, startWith } from "rxjs";
  import GoModuleLoader from "./utils/GoModuleLoader";
  // import { Attribute } from "./Domain";
  import AttributeView from "./AttributeView.svelte";
  import Logger from "./utils/Logger";
  import MainContext from "./MainContext";
  import Dehydrator from "./hydration/Dehydrator";
  import Rehydrator from "./hydration/Rehydrator";
  import Main from "./utils/Main";
  import { type ReadonlyAttribute } from "./Domain";
  import { Attribute } from "./ExprFactory";

  const logger = Logger.file("MainView.svelte");

  let ctx: MainContext | null = null;
  let attribute: Attribute | null = null;
  // let rehydratedAttribute = null;
  let result = -1;

  async function setup() {
    const main = await Main.setup();
    ctx = main.ctx;
    attribute = main.attribute;

    // Dehydrator.dehydrateAttribute$(attribute).subscribe(
    //   (dehydratedAttribute) => {
    //     rehydratedAttribute =
    //       Rehydrator.rehydrateAttribute(dehydratedAttribute);
    //     logger.log("dehydratedAttribute", dehydratedAttribute.toString());
    //     logger.log("rehydratedAttribute", rehydratedAttribute.toString());
    //   }
    // );

    // interval(1000).subscribe((v) => {
    //   result = ctx.eval();
    //   const obs = Logger.getMessages$().observers;
    //   logger.log("observers", obs);
    // });
  }

  setup();

  // document.addEventListener("mousedown", (e) => {
  //   logger.log("handleClick");
  //   ctx?.selection.select(of(null));
  // });
</script>

<main>
  <div>Hello World</div>
  <div>{result}</div>

  {#if ctx === null || attribute === null}
    <div>Loading...</div>
  {:else}
    <div>Loaded</div>
    <AttributeView {ctx} {attribute} />
    <!-- {#key rehydratedAttribute}
      <AttributeView {ctx} attribute={rehydratedAttribute} />
    {/key} -->
  {/if}
</main>

<style></style>
