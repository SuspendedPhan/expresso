<script lang="ts">
  import { Effect } from "effect";
  import { ExObject } from "src/ex-object/ExObject";
  import { dexMakeSvelteScope, DexRuntime } from "src/utils/utils/DexRuntime";
  import BasicPropertyList from "src/utils/views/BasicPropertyList.svelte";
  import ExObjectButton from "src/utils/views/ExObjectButton.svelte";
  import ExObjectHeaderView from "src/utils/views/ExObjectHeaderView.svelte";
  import FlexContainer from "src/utils/views/FlexContainer.svelte";
  import TextField from "src/utils/views/TextField.svelte";
  import type { ElementLayout } from "../layout/ElementLayout";
  import NodeView from "../layout/NodeView.svelte";
  import type { DexSetup } from "../utils/EffectUtils";
  import ComponentSelect from "./ComponentSelect.svelte";
  import type { ExObjectViewState } from "./ExObjectView";
  import PropertyView from "./PropertyView.svelte";

  export let setup: DexSetup<ExObjectViewState>;
  export let elementLayout: ElementLayout;

  let exObject: ExObjectViewState["exObject"];
  let nameFieldProp: ExObjectViewState["nameFieldProp"];
  let componentFieldProp: ExObjectViewState["componentFieldProp"];
  let componentParameterProperties: ExObjectViewState["componentParameterProperties"];
  let cloneCountProperty: ExObjectViewState["cloneCountProperty"];
  let basicProperties: ExObjectViewState["basicProperties"];
  let children: ExObjectViewState["children"];

  let ready = false;

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

      ready = true;
    }).pipe(DexRuntime.runPromise);
  });

  function addChild() {
    DexRuntime.runPromise(
      Effect.gen(function* () {
        yield* ExObject.Methods(exObject).addChildBlank();
      })
    );
  }
</script>

{#if ready}
  <NodeView elementKey={exObject.id} {elementLayout}>
    <div>
      <FlexContainer class="ex-card w-max flex flex-col">
        <div class="p-card flex flex-col">
          <ExObjectHeaderView>Basics</ExObjectHeaderView>
          <div class="flex flex-col gap-2 font-mono">
            <TextField setup={nameFieldProp[0]} />
            <ComponentSelect setup={componentFieldProp.setup} />
          </div>
        </div>

        <!-- Divider -->
        <div class="divider m-0 h-0"></div>
        <div class="p-card">
          <ExObjectHeaderView>Component</ExObjectHeaderView>
          <div class="flex flex-col gap-2">
            <PropertyView setup={$cloneCountProperty} />
            {#if $componentParameterProperties}
              {#each $componentParameterProperties as property (property.id)}
                <PropertyView setup={property.setup} />
              {/each}
            {/if}
          </div>
        </div>

        <!-- Divider -->
        <div class="divider m-0 h-0"></div>
        <FlexContainer centered={false} class="flex flex-col p-card">
          {#if $basicProperties}
            <BasicPropertyList setup={$basicProperties} />
          {/if}
        </FlexContainer>

        <!-- Divider -->
        <div class="divider m-0 h-0"></div>
        <div class="p-card self-center">
          <ExObjectButton on:click={addChild}>Add Child Object</ExObjectButton>
        </div>
      </FlexContainer>
      {#if $children}
        {#each $children as child (child.id)}
          <svelte:self setup={child.setup} {elementLayout} />
        {/each}
      {/if}
    </div>
  </NodeView>
{/if}
