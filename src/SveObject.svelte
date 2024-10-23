<script lang="ts">
  import { Effect } from "effect";
  import { FocusKind } from "./AppState";
  import { AppStateCtx } from "./AppStateCtx";
  import { DexObject } from "./DexDomain";
  import { DexGetter } from "./DexGetter";
  import { DexReducer } from "./DexReducer";
  import { DexRuntime } from "./DexRuntime";
  import ExObjectHeaderView from "./ExObjectHeaderView.svelte";
  import FlexContainer from "./FlexContainer.svelte";
  import SveProperty from "./SveProperty.svelte";
  import type { TextFieldProps } from "./TextField";
  import TextField from "./TextField.svelte";

  export let dexObject: DexObject;

  let nameProps: TextFieldProps;

  let ready = false;

  Effect.gen(function* () {
    const reducer = (value: string) => DexReducer.fromProjectReducer(DexReducer.DexObject.setName(dexObject, value));
    const appState = yield* AppStateCtx.getAppState;
    nameProps = {
      label: "Name",
      value: dexObject.name,
      onInput: yield* AppStateCtx.getTextFieldOnInput(reducer),
      isEditing: DexGetter.isEditing(appState, FocusKind.Object_Name, dexObject.id),
      focusViewProps: {
        focused: DexGetter.isFocused(appState, FocusKind.Object_Name, dexObject.id),
        onMouseDown: yield* AppStateCtx.makeReducerApplier(
          DexReducer.AppState.setFocus(FocusKind.Object_Name, dexObject.id),
        ),
      },
    };
    ready = true;
  }).pipe(DexRuntime.runPromise);
</script>

{#if ready}
  <!-- <NodeView elementKey={dexObject.id} {elementLayout}> -->
  <div>
    <FlexContainer class="ex-card w-max flex flex-col">
      <div class="p-card flex flex-col">
        <ExObjectHeaderView>Basics</ExObjectHeaderView>
        <div class="flex flex-col gap-2 font-mono">
          <TextField props={nameProps} />
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
        <!-- <ExObjectButton on:click={addChild}>Add Child Object</ExObjectButton> -->
      </div>
    </FlexContainer>
    {#each dexObject.children as child (child.id)}
      <!-- <svelte:self dexObject={child} {elementLayout} /> -->
    {/each}
  </div>
  <!-- </NodeView> -->
{/if}
