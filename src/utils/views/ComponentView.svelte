<script lang="ts">
  import { map } from "rxjs";
  import type { Attribute, Component } from "src/ex-object/ExObject";
  import ExprView from "./ExprView.svelte";
  import type MainContext from "src/main-context/MainContext";
  import SelectableView from "src/utils/utils/SelectableView.svelte";

  export let ctx: MainContext;
  export let component: Component;
</script>

<main>
  <SelectableView {ctx} object={component}>
    <div>Attribute</div>
    {#key $exprId$}
      <ExprView {ctx} expr={$expr$} />
    {/key}
  </SelectableView>
</main>
