<script lang="ts">
  import type { Attribute } from "./ExObject";
  import ExprView from "./ExprView.svelte";
  import MainContext from "./MainContext";
  import SelectableView from "./utils/SelectableView.svelte";

  export let ctx: MainContext;
  export let attribute: Attribute;

  const expr$ = attribute.expr$;
</script>

<main>
  <SelectableView {ctx} object={attribute}>
    <div>Attribute</div>
    <ExprView {ctx} {$expr$} />
  </SelectableView>
</main>
