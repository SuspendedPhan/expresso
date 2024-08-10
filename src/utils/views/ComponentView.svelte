<script lang="ts">
  import { map } from "rxjs";
  import {
    ComponentUtils,
    type CustomComponent,
  } from "src/ex-object/Component";
  import MainContext from "src/main-context/MainContext";
  import { ElementLayout } from "src/utils/layout/ElementLayout";
  import TreeListContainer from "src/utils/layout/TreeListContainer.svelte";
  import {
    Constants
  } from "src/utils/utils/ViewUtils";
  import RootExObjectView from "src/utils/views/RootExObjectView.svelte";
  export let ctx: MainContext;
  export let component: CustomComponent;

  const name$ = ComponentUtils.getName$(component);
  const rootExObjectPropsL$ = component.rootExObjects$.pipe(
    map((rootExObjects) =>
      rootExObjects.map((rootExObject) => {
        const elementLayout = new ElementLayout();
        return {
          exObject: rootExObject,
          elementLayout,
        };
      }
    )
  );
</script>

<div>{$name$}</div>
<TreeListContainer
  class="flex flex-col items-center"
  containerPadding={Constants.WindowPadding}
  layouts$={ctx.viewCtx.exObjectLayouts$}
>
  {#each $rootExObjectPropsL$ as props (props.exObject.id)}
    <RootExObjectView
      {ctx}
      exObject={props.exObject}
      elementLayout={props.elementLayout}
    />
  {/each}
</TreeListContainer>
