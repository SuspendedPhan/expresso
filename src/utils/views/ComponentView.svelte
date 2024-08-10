<script lang="ts">
  import {
    ComponentUtils,
    type CustomComponent,
  } from "src/ex-object/Component";
  import MainContext from "src/main-context/MainContext";
  import RootExObjectView from "src/utils/views/RootExObjectView.svelte";
  export let ctx: MainContext;
  export let component: CustomComponent;

  const name$ = ComponentUtils.getName$(component);
  const rootExObjects$ = component.rootExObjects$;
</script>

<div>{$name$}</div>
{#each $rootExObjects$ as exObject (exObject.id)}
  <RootExObjectView {ctx} {exObject} />
{/each}
