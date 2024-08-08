<script lang="ts">
  import { ResizeSensor } from "css-element-queries";
  import { combineLatest, map, ReplaySubject, switchMap } from "rxjs";
  import MainContext from "src/main-context/MainContext";
  import { onMount } from "svelte";
  import { Constants } from "../utils/ViewUtils";
  import KbdShortcutSpan from "./KbdShortcutSpan.svelte";
  import RootExObjectView from "src/utils/views/RootExObjectView.svelte";

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

  const xTranslation$ = ctx.viewCtx.exObjectLayouts$.pipe(
    map((layouts) => {
      return combineLatest(layouts.map((layout) => layout.onCalculated));
    }),
    switchMap((outputs) => {
      return combineLatest([editorViewWidth$, outputs]);
    }),
    map(([width, outputs]) => {
      // Get the largest width
      let largestWidth = 0;
      for (const output of outputs) {
        if (output.totalWidth > largestWidth) {
          largestWidth = output.totalWidth;
        }
      }

      if (largestWidth < width) {
        return `${Constants.WindowPaddingRem}rem`;
      } else {
        const translation = largestWidth / 2 - width / 2;
        return `calc(${translation}px + ${Constants.WindowPaddingRem}rem)`;
      }
    })
  );
</script>

<div bind:this={rootElement}>
  <div
    class="flex flex-col items-center"
    style:transform="translateX({$xTranslation$})"
  >
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
    <div class="grid grid-flow-row">
      {#if $rootExObjects$}
        {#each $rootExObjects$ as exObject (exObject.id)}
          <div class="divider m-0 h-0"></div>
          <RootExObjectView {ctx} {exObject} />
        {/each}
      {/if}
    </div>
  </div>
</div>

<style></style>
