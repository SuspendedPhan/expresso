<script lang="ts">
  import { DexObject } from "./DexDomain";
  import { FocusKind } from "./DexFocus";
  import { DexReducer } from "./DexReducer";
  import { DexRuntime_RunReducer } from "./DexRuntime";
  import ExObjectButton from "./ExObjectButton.svelte";
  import ExObjectHeaderView from "./ExObjectHeaderView.svelte";
  import FlexContainer from "./FlexContainer.svelte";
  import SveProperty from "./SveProperty.svelte";
  import TextField from "./TextField.svelte";
  import type { ElementLayout } from "./utils/layout/ElementLayout";
  import NodeView from "./utils/layout/NodeView.svelte";

  export let dexObject: DexObject;
  export let elementLayout: ElementLayout;

  function addChild() {
    DexRuntime_RunReducer(DexReducer.DexObject.addChild(dexObject));
  }
</script>

<NodeView elementKey={dexObject.id} {elementLayout}>
  <div>
    <FlexContainer class="ex-card w-max flex flex-col">
      <div class="p-card flex flex-col">
        <ExObjectHeaderView>Basics</ExObjectHeaderView>
        <div class="flex flex-col gap-2 font-mono">
          <TextField target={{ _tag: "TextFieldFocusTarget", kind: FocusKind.Object_Name, targetId: dexObject.id }} />
          <!-- <ComponentSelect props={componentProps} /> -->
        </div>
      </div>

      <!-- Divider -->
      <div class="divider m-0 h-0"></div>
      <div class="p-card">
        <ExObjectHeaderView>Component</ExObjectHeaderView>
        <div class="flex flex-col gap-2">
          <SveProperty property={dexObject.cloneCountProperty} />
          {#each dexObject.componentParameterProperties as property}
            <SveProperty {property} />
          {/each}
        </div>
      </div>

      <!-- Divider -->
      <div class="divider m-0 h-0"></div>
      <FlexContainer centered={false} class="flex flex-col p-card">
        <!-- <BasicPropertyList properties={dexObject.basicProperties} /> -->
      </FlexContainer>

      <!-- Divider -->
      <div class="divider m-0 h-0"></div>
      <div class="p-card self-center">
        <ExObjectButton on:click={addChild}>Add Child Object</ExObjectButton>
      </div>
    </FlexContainer>
    {#each dexObject.children as child (child.id)}
      <svelte:self dexObject={child} {elementLayout} />
    {/each}
  </div>
</NodeView>
