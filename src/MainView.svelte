<script lang="ts">
  import { combineLatest, interval, map, startWith } from "rxjs";
  import GoModuleLoader from "./GoModuleLoader";
  import { Attribute } from "./Domain";
  import AttributeView from "./AttributeView.svelte";
  import Logger from "./Logger";
  import MainContext from "./MainContext";

  const goModule$ = GoModuleLoader.get$();
  let ctx: MainContext | null = null;
  let attribute = null;
  let result = -1;

  goModule$.subscribe((v) => {
    ctx = new MainContext(v);
    attribute = ctx.attribute;
    interval(1000).subscribe((v) => {
      // console.log("interval", v);
      result = ctx.eval();
    });
  });
</script>

<main>
  <div>Hello World</div>
  <div>{result}</div>

  {#if ctx === null || attribute === null}
    <div>Loading...</div>
  {:else}
    <div>Loaded</div>
    <AttributeView {ctx} {attribute} />
  {/if}
</main>

<style></style>
