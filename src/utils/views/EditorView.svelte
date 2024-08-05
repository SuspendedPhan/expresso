<script lang="ts">
  import { ResizeSensor } from "css-element-queries";
  import { combineLatest, map, ReplaySubject, switchMap } from "rxjs";
  import MainContext from "src/main-context/MainContext";
  import { onMount } from "svelte";
  import RootExObjectView from "./RootExObjectView.svelte";
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
        return `0`;
      } else {
        const translation = largestWidth / 2 - width / 2;
        return `calc(${translation}px + 1rem)`;
      }
    })
  );
</script>

<div bind:this={rootElement}>
  <div
    class="flex flex-col items-center {Constants.WindowPaddingClass}"
    style:transform="translateX({$xTranslation$})"
  >
    <div class="flex gap-4">
      <button
        on:click={() => ctx.projectMutator.addRootObject()}
        class="btn block"
        ><KbdShortcutSpan
          label="Add ExObject"
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
    </div>
    <div class="grid grid-flow-row">
      {#if $rootExObjects$}
        {#each $rootExObjects$ as exObject (exObject.id)}
          <div class="divider"></div>
          <RootExObjectView {ctx} {exObject} />
        {/each}
      {/if}
    </div>
  </div>
</div>

<style></style>
