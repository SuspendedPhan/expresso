<script lang="ts">
  import { combineLatest, interval, map, startWith } from "rxjs";
  import GoModuleLoader from "./utils/GoModuleLoader";
  import { Attribute } from "./Domain";
  import AttributeView from "./AttributeView.svelte";
  import Logger from "./utils/Logger";
  import MainContext from "./MainContext";
  import Dehydrator from "./Dehydrator";
  import Rehydrator from "./Rehydrator";

  const logger = Logger.topic("MainView.svelte");

  const goModule$ = GoModuleLoader.get$();
  let ctx: MainContext | null = null;
  let attribute = null;
  let rehydratedAttribute = null;
  let result = -1;

  goModule$.subscribe((goModule) => {
    ctx = new MainContext(goModule);
    attribute = ctx.attribute;
    interval(1000).subscribe((v) => {
      // console.log("interval", v);
      // goModule.debug();
      result = ctx.eval();
    });

    Dehydrator.dehydrateAttribute$(attribute).subscribe(
      (dehydratedAttribute) => {
        rehydratedAttribute =
          Rehydrator.rehydrateAttribute(dehydratedAttribute);
        logger.log("dehydratedAttribute", dehydratedAttribute.toString());
        logger.log("rehydratedAttribute", rehydratedAttribute.toString());
      }
    );
  });
</script>

<main>
  <div>Hello World</div>
  <div>{result}</div>

  {#if ctx === null || attribute === null || rehydratedAttribute === null}
    <div>Loading...</div>
  {:else}
    <div>Loaded</div>
    <AttributeView {ctx} {attribute} />
    {#key rehydratedAttribute}
      <AttributeView {ctx} attribute={rehydratedAttribute} />
    {/key}
  {/if}
</main>

<style></style>
