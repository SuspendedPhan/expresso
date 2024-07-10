<script lang="ts">
  import ExprView from "./ExprView.svelte";
  import Logger from "./utils/Logger";
  import MainContext from "./MainContext";
  import SelectableView from "./utils/SelectableView.svelte";
  import type { AttributeMut } from "./ExprFactory";

  export let ctx: MainContext;
  export let attribute: AttributeMut;
  const expr$ = attribute.exprMut$;
  expr$.subscribe((v) => Logger.file("AttributeView").log("expr$", v));
</script>

<main>
  <SelectableView {ctx} object={attribute.attribute}>
    <div>Attribute</div>
    {#key $expr$}
      <ExprView {ctx} expr={$expr$} />
    {/key}
  </SelectableView>
</main>
