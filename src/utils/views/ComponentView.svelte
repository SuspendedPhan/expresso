<script lang="ts">
  import { ComponentFns, type CustomComponent } from "src/ex-object/Component";
  import type MainContext from "src/main-context/MainContext";
  import RootExObjectView from "src/utils/views/RootExObjectView.svelte";
  export let ctx: MainContext;
  export let component: CustomComponent;

  const name$ = ComponentFns.getName$(component);
  const rootExObjects$ = component.rootExObjects$;

  function addExObject() {
    ComponentFns.addRootExObjectBlank(ctx, component);
  }
</script>

<div>{$name$}</div>
<button class="btn btn-sm" on:click={addExObject}>Add Object</button>
<div class="ex-card w-max flex flex-col">
  {#each $rootExObjects$ as rootExObject}
    <RootExObjectView {ctx} exObject={rootExObject} />
  {/each}
</div>
