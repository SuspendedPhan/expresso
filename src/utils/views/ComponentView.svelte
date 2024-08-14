<script lang="ts">
  import { ComponentFns, type CustomComponent } from "src/ex-object/Component";
  import type MainContext from "src/main-context/MainContext";
  import FlexContainer from "src/utils/views/FlexContainer.svelte";
  import RootExObjectView from "src/utils/views/RootExObjectView.svelte";
  export let ctx: MainContext;
  export let component: CustomComponent;

  const name$ = ComponentFns.getName$(component);
  const rootExObjects$ = component.rootExObjects$;

  function addExObject() {
    ComponentFns.addRootExObjectBlank(ctx, component);
  }
</script>

<FlexContainer class="p-window ex-card">
  <div>{$name$}</div>
  <button class="btn btn-sm w-max" on:click={addExObject}>Add Object</button>
  <FlexContainer>
    {#each $rootExObjects$ as rootExObject}
      <RootExObjectView {ctx} exObject={rootExObject} />
    {/each}
  </FlexContainer>
</FlexContainer>
