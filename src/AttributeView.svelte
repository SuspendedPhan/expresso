<script lang="ts">
  import type { Attribute } from "./Domain";
  import ExprView from "./ExprView.svelte";
  import Logger from "./utils/Logger";
  import MainContext from "./MainContext";

  export let ctx: MainContext;
  export let attribute: Attribute;
  const expr$ = attribute.getExpr$();
  expr$.subscribe((v) => Logger.topic("AttributeView").log("expr$", v));
</script>

<main>
  {#key $expr$}
    <ExprView {ctx} expr={$expr$} />
  {/key}
</main>
