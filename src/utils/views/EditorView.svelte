<script lang="ts">
  import { ResizeSensor } from "css-element-queries";
  import { ReplaySubject } from "rxjs";
  import MainContext from "src/main-context/MainContext";
  import { FocusFns } from "src/utils/utils/Focus";
  import { Focus2Kind } from "src/utils/utils/FocusManager";
  import RootExObjectView from "src/utils/views/RootExObjectView.svelte";
  import { onMount } from "svelte";
  import { Constants } from "../utils/ViewUtils";
  import KbdShortcutSpan from "./KbdShortcutSpan.svelte";
  import FlexContainer from "./FlexContainer.svelte";

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

  const newActionsFocused$ = FocusFns.isFocus2Focused$(
    ctx,
    Focus2Kind.is.EditorNewActions
  );
</script>

<div bind:this={rootElement} class="w-max min-w-full">
  <FlexContainer>
    <div class="flex gap-4 {Constants.WindowPaddingClass}">
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
    <FlexContainer>
      {#if $rootExObjects$}
        {#each $rootExObjects$ as exObject (exObject.id)}
          <div class="divider w-full m-0 h-0"></div>
          <RootExObjectView {ctx} {exObject} />
        {/each}
      {/if}
    </FlexContainer>
  </FlexContainer>
</div>
