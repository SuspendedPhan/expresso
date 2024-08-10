<script lang="ts">
  import {
    ComponentUtils,
    type CustomComponent,
  } from "src/ex-object/Component";
  import MainContext from "src/main-context/MainContext";
  import RootExObjectView from "src/utils/views/RootExObjectView.svelte";
  import { BehaviorSubject } from "rxjs";
  import MainContext from "src/main-context/MainContext";
  import type { ElementLayout } from "src/utils/layout/ElementLayout";
  import TreeListContainer from "src/utils/layout/TreeListContainer.svelte";
  import { Constants } from "src/utils/utils/ViewUtils";
  export let ctx: MainContext;
  export let component: CustomComponent;

  const name$ = ComponentUtils.getName$(component);
  const rootExObjects$ = component.rootExObjects$;
  const exObjectLayouts$ = new BehaviorSubject<readonly ElementLayout[]>([]);
</script>

<div>{$name$}</div>
<TreeListContainer
  class="flex flex-col items-center"
  containerPadding={Constants.WindowPadding}
  layouts$={ctx.viewCtx.exObjectLayouts$}
>
  {#each $rootExObjects$ as exObject (exObject.id)}
    <RootExObjectView {ctx} {exObject} />
  {/each}
</TreeListContainer>
