<script lang="ts">
  import type { Attribute } from "./Domain";
  import ExprView from "./ExprView.svelte";
  import Logger from "./utils/Logger";
  import MainContext from "./MainContext";
  import SelectableView from "./utils/SelectableView.svelte";

  export let ctx: MainContext;
  export let attribute: Attribute;
  const expr$ = attribute.expr$;
  expr$.subscribe((v) => Logger.file("AttributeView").log("expr$", v));
</script>

<main>
  <SelectableView {ctx} object={attribute}>
    <div>Attribute</div>
    {#key $expr$}
      <ExprView {ctx} expr={$expr$} />
    {/key}
  </SelectableView>
</main>
