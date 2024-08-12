<script lang="ts">
  import { ComponentFns, type CustomComponent } from "src/ex-object/Component";
  import MainContext from "src/main-context/MainContext";
  import TreeListContainer from "src/utils/layout/TreeListContainer.svelte";
  import { RootExObjectViewFns } from "src/utils/utils/RootExObjectView";
  import { Constants } from "src/utils/utils/ViewUtils";
  import RootExObjectView from "src/utils/views/RootExObjectView.svelte";
  export let ctx: MainContext;
  export let component: CustomComponent;

  const name$ = ComponentFns.getName$(component);
  const rootExObjectViewPropL$ = RootExObjectViewFns.get$(
    ctx,
    ctx.eventBus.rootObjects$
  );
</script>

<div>{$name$}</div>
<TreeListContainer
  class="flex flex-col items-center"
  containerPadding={Constants.WindowPadding}
  layouts$={ctx.viewCtx.exObjectLayouts$}
>
  {#each $rootExObjectViewPropL$ as props (props.exObject.id)}
    <RootExObjectView
      {ctx}
      exObject={props.exObject}
      elementLayout={props.elementLayout}
    />
  {/each}
</TreeListContainer>
