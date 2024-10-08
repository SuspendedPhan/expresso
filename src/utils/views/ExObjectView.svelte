<script lang="ts">
  import { Effect } from "effect";
  import { switchAll, switchMap } from "rxjs";
  import { ExObject } from "src/ex-object/ExObject";
  import {
    ExObjectFocus,
    ExObjectFocusFactory,
    type ExObjectFocusKind,
  } from "src/focus/ExObjectFocus";
  import { FocusCtx } from "src/focus/FocusCtx";
  import { DexRuntime } from "src/utils/utils/DexRuntime";
  import { RxFns } from "src/utils/utils/Utils";
  import BasicPropertyList from "src/utils/views/BasicPropertyList.svelte";
  import ComponentSelect from "src/utils/views/ComponentSelect.svelte";
  import ExObjectButton from "src/utils/views/ExObjectButton.svelte";
  import ExObjectHeaderView from "src/utils/views/ExObjectHeaderView.svelte";
  import { type FieldData } from "src/utils/views/Field";
  import Field from "src/utils/views/Field.svelte";
  import FlexContainer from "src/utils/views/FlexContainer.svelte";
  import FocusView from "src/utils/views/FocusView.svelte";
  import { createTextFieldData } from "src/utils/views/TextField";
  import { isType } from "variant";
  import type { ElementLayout } from "../layout/ElementLayout";
  import NodeView from "../layout/NodeView.svelte";
  import PropertyView from "./PropertyView.svelte";

  export let exObject: ExObject;
  export let elementLayout: ElementLayout;

  const componentParameterProperties$ =
    exObject.componentParameterProperties_.items$;
  const cloneCountProperty = exObject.cloneCountProperty;
  const basicProperties$ = exObject.basicProperties.items$;
  const children$ = exObject.children$;

  let exObjectFocused = false;

  RxFns.onMount$()
    .pipe(
      switchMap(() => DexRuntime.runPromise(ExObjectFocus.exObjectFocus$)),
      switchAll()
    )
    .subscribe((exObject) => {
      exObjectFocused = exObject !== false && exObject === exObject;
    });

  let exObjectNameField: FieldData;
  DexRuntime.runPromise(
    Effect.gen(function* () {
      exObjectNameField = yield* createTextFieldData<ExObjectFocusKind["Name"]>(
        {
          label: "Name",
          value$: exObject.name$,
          focusIsFn: isType(ExObjectFocusFactory.Name),
          createEditingFocusFn: (isEditing) =>
            ExObjectFocusFactory.Name({ exObject, isEditing }),
          filterFn: (f) => f.exObject === exObject,
        }
      );
    })
  );

  function handleClick() {
    DexRuntime.runPromise(
      Effect.gen(function* () {
        FocusCtx.setFocus(ExObjectFocusFactory.ExObject({ exObject }));
      })
    );
  }

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
    <FocusView
      focused={exObjectFocused}
      on:mousedown={handleClick}
      class="ex-card w-max flex flex-col"
    >
      <div class="p-card flex flex-col">
        <ExObjectHeaderView>Basics</ExObjectHeaderView>
        <div class="flex flex-col gap-2 font-mono">
          <Field fieldData={exObjectNameField} />
          <!-- todp: component go bridge -->
          <ComponentSelect {exObject} />
        </div>
      </div>

      <!-- Divider -->
      <div class="divider m-0 h-0"></div>
      <div class="p-card">
        <ExObjectHeaderView>Component</ExObjectHeaderView>
        <div class="flex flex-col gap-2">
          <PropertyView property={cloneCountProperty} />
          {#each $componentParameterProperties$ as property (property.id)}
            <PropertyView {property} />
          {/each}
        </div>
      </div>

      <!-- Divider -->
      <div class="divider m-0 h-0"></div>
      <FlexContainer centered={false} class="flex flex-col p-card">
        <BasicPropertyList {basicProperties$} addPropertyFn={addProperty} />
      </FlexContainer>

      <!-- Divider -->
      <div class="divider m-0 h-0"></div>
      <div class="p-card self-center">
        <ExObjectButton on:click={addChild}>Add Child Object</ExObjectButton>
      </div>
    </FocusView>
    {#if $children$}
      {#each $children$ as child (child.id)}
        <svelte:self exObject={child} {elementLayout} />
      {/each}
    {/if}
  </div>
</NodeView>
