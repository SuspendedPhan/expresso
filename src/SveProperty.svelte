<script lang="ts">
  import { match } from "ts-pattern";
  import { type DexProperty } from "./DexDomain";
  import { FocusKind, TextFieldFocusTarget } from "./DexFocus";
  import SveRootExpr from "./SveRootExpr.svelte";
  import TextField from "./TextField.svelte";

  export let property: DexProperty;
  const isNumberExpr = property.expr._tag === "NumberExpr";
  const isBasicProperty = property._tag === "DexBasicProperty";

  const name = match(property)
    .with({ _tag: "DexBasicProperty" }, (p) => p.name)
    .with({ _tag: "DexCloneCountProperty" }, (p) => "Clone Count")
    .with({ _tag: "DexComponentParameterProperty" }, (p) => p.parameter.name)
    .exhaustive();
</script>

<div class:flex={isNumberExpr} class="items-center font-mono">
  <div class="flex flex-row">
    {#if isBasicProperty}
      <TextField target={TextFieldFocusTarget({ kind: FocusKind.Property_Name, targetId: property.id })} />
    {:else}
      <pre>{name}</pre>
    {/if}
    <pre class="text-style-secondary"> = </pre>
  </div>

  <SveRootExpr expr={property.expr} />
</div>
