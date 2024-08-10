<script lang="ts">
  import { ResizeSensor } from "css-element-queries";
  import { map, ReplaySubject } from "rxjs";
  import MainContext from "src/main-context/MainContext";
  import TreeListContainer from "src/utils/layout/TreeListContainer.svelte";
  import RootExObjectView from "src/utils/views/RootExObjectView.svelte";
  import { onMount } from "svelte";
  import { Constants } from "../utils/ViewUtils";
  import KbdShortcutSpan from "./KbdShortcutSpan.svelte";

  export let ctx: MainContext;
  const rootExObjects$ = ctx.eventBus.rootObjects$;

  let rootElement: HTMLElement;
  const editorViewWidth$ = new ReplaySubject<number>(1);

  onMount(() => {
    const sensor = new ResizeSensor(rootElement, ({ width }) => {
      editorViewWidth$.next(width);
    });
    return () => {
      sensor.detach();
    };
  });

  const newActionsFocused$ = ctx.focusManager
    .getFocus$()
    .pipe(map((focus) => focus.type === "NewActions"));
</script>

<div bind:this={rootElement} style:left={Constants.WindowPadding}>
  <TreeListContainer
    class="flex flex-col items-center"
    containerPadding={Constants.WindowPadding}
    layouts$={ctx.viewCtx.exObjectLayouts$}
  >
    <div class="flex gap-4">
      <button
        on:click={() => ctx.projectMutator.addRootObject()}
        class="btn block"
        ><KbdShortcutSpan
          label="Add Object"
          showShortcut={$newActionsFocused$}
          underlineCharIndex={4}
        /></button
      >
      <button
        on:click={() => ctx.projectManager.addProjectNew()}
        class="btn block"
      >
        <KbdShortcutSpan
          label="New Project"
          showShortcut={$newActionsFocused$}
          underlineCharIndex={4}
        />
      </button>

      <button on:click={() => ctx.goModule.Evaluator.debug()} class="btn block">
        Debug Evaluator
      </button>
    </div>
    <div class="divider"></div>
    <div class="grid grid-flow-row">
      {#if $rootExObjects$}
        {#each $rootExObjects$ as exObject (exObject.id)}
          <div class="divider m-0 h-0"></div>
          <RootExObjectView {ctx} {exObject} />
        {/each}
      {/if}
    </div>
  </TreeListContainer>
</div>

<style></style>
