<script lang="ts">
  import { combineLatest, map, startWith } from "rxjs";
  import GoModuleLoader from "./GoModuleLoader";
  import { Attribute } from "./Domain";
  import AttributeView from "./AttributeView.svelte";
  import Logger from "./Logger";
  import MainContext from "./MainContext";

  const goModule$ = GoModuleLoader.get$();
  let ctx: MainContext | null = null;
  let attribute = null;

  goModule$.subscribe((v) => {
    ctx = new MainContext(v);
    attribute = ctx.createAttribute();
  });
</script>

<main>
  <div>Hello World</div>

  {#if ctx === null || attribute === null}
    <div>Loading...</div>
  {:else}
    <div>Loaded</div>
    <AttributeView {ctx} {attribute} />
  {/if}
</main>

<style></style>
