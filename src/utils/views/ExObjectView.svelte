<script lang="ts">
  import { Effect } from "effect";
  import { ExObject } from "src/ex-object/ExObject";
  import { dexMakeSvelteScope, DexRuntime } from "src/utils/utils/DexRuntime";
  import BasicPropertyList from "src/utils/views/BasicPropertyList.svelte";
  import ExObjectButton from "src/utils/views/ExObjectButton.svelte";
  import ExObjectHeaderView from "src/utils/views/ExObjectHeaderView.svelte";
  import FlexContainer from "src/utils/views/FlexContainer.svelte";
  import { type TextFieldPropIn } from "src/utils/views/TextField";
  import Field from "src/utils/views/TextField.svelte";
  import type { ElementLayout } from "../layout/ElementLayout";
  import NodeView from "../layout/NodeView.svelte";
  import type { DexSetup } from "../utils/EffectUtils";
  import type { ExObjectViewState } from "./ExObjectView";
  import PropertyView from "./PropertyView.svelte";
  import ComponentSelect from "./ComponentSelect.svelte";

  export let setup: DexSetup<ExObjectViewState>;
  export let elementLayout: ElementLayout;

  let exObject: ExObjectViewState["exObject"];
  let nameFieldProp: ExObjectViewState["nameFieldProp"];
  let componentFieldProp: ExObjectViewState["componentFieldProp"];
  let componentParameterProperties: ExObjectViewState["componentParameterProperties"];
  let cloneCountProperty: ExObjectViewState["cloneCountProperty"];
  let basicProperties: ExObjectViewState["basicProperties"];
  let children: ExObjectViewState["children"];

  let exObjectNameField: TextFieldPropIn;

  dexMakeSvelteScope().then((scope) => {
    Effect.gen(function* () {
      const state = yield* setup(scope);
      exObject = state.exObject;
      nameFieldProp = state.nameFieldProp;
      componentFieldProp = state.componentFieldProp;
      componentParameterProperties = state.componentParameterProperties;
      cloneCountProperty = state.cloneCountProperty;
      basicProperties = state.basicProperties;
      children = state.children;
    }).pipe(DexRuntime.runPromise);
  });

  function addChild() {
    DexRuntime.runPromise(
      Effect.gen(function* () {
        yield* ExObject.Methods(exObject).addChildBlank();
      })
    );
  }

  function addProperty() {
    DexRuntime.runPromise(
      Effect.gen(function* () {
        yield* ExObject.Methods(exObject).addBasicPropertyBlank();
      })
    );
  }
</script>

<NodeView elementKey={exObject.id} {elementLayout}>
  <div>
    <FlexContainer class="ex-card w-max flex flex-col">
      <div class="p-card flex flex-col">
        <ExObjectHeaderView>Basics</ExObjectHeaderView>
        <div class="flex flex-col gap-2 font-mono">
          <Field propIn={exObjectNameField} />
          <ComponentSelect setup={componentFieldProp.setup} />
        </div>
      </div>

      <!-- Divider -->
      <div class="divider m-0 h-0"></div>
      <div class="p-card">
        <ExObjectHeaderView>Component</ExObjectHeaderView>
        <div class="flex flex-col gap-2">
          <PropertyView property={$cloneCountProperty} />
          {#each $componentParameterProperties as property (property.id)}
            <PropertyView {property} />
          {/each}
        </div>
      </div>

      <!-- Divider -->
      <div class="divider m-0 h-0"></div>
      <FlexContainer centered={false} class="flex flex-col p-card">
        <BasicPropertyList {basicProperties} addPropertyFn={addProperty} />
      </FlexContainer>

      <!-- Divider -->
      <div class="divider m-0 h-0"></div>
      <div class="p-card self-center">
        <ExObjectButton on:click={addChild}>Add Child Object</ExObjectButton>
      </div>
    </FlexContainer>
    {#if $children}
      {#each $children as child (child.id)}
        <svelte:self exObject={child} {elementLayout} />
      {/each}
    {/if}
  </div>
</NodeView>
