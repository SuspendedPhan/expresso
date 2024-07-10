<script lang="ts">
  import type { ReadonlyAttribute } from "./Domain";
  import ExprView from "./ExprView.svelte";
  import Logger from "./utils/Logger";
  import MainContext from "./MainContext";
  import SelectableView from "./utils/SelectableView.svelte";
  import type { Attribute } from "./ExprFactory";

  export let ctx: MainContext;
  export let attribute: Attribute;
  const expr$ = attribute.expr$;
  expr$.subscribe((v) => Logger.file("AttributeView").log("expr$", v));
</script>

<main>
  <SelectableView {ctx} object={attribute.readonlyAttribute}>
    <div>Attribute</div>
    {#key $expr$}
      <ExprView {ctx} expr={$expr$} />
    {/key}
  </SelectableView>
</main>
