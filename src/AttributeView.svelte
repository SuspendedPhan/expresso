<script lang="ts">
  import type { Attribute } from "./Domain";
  import ExprView from "./ExprView.svelte";
  import Logger from "./Logger";

  export let attribute: Attribute;
  const expr$ = attribute.getExpr$();
  expr$.subscribe((v) => Logger.topic("AttributeView").log("expr$", v));
</script>

<main>
  {#key $expr$}
    <ExprView expr={$expr$} />
  {/key}
</main>
