<script lang="ts">
  import { ResizeSensor } from "css-element-queries";
  import { combineLatest, map, ReplaySubject, switchMap } from "rxjs";
  import MainContext from "src/main-context/MainContext";
  import { onMount } from "svelte";
  import RootComponentView from "./RootComponentView.svelte";
  import { Constants } from "../utils/ViewUtils";
  import KbdShortcutSpan from "./KbdShortcutSpan.svelte";

  export let ctx: MainContext;
  const rootComponents$ = ctx.eventBus.rootComponents$;

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

  const xTranslation$ = ctx.viewCtx.componentLayouts$.pipe(
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
        on:click={() => ctx.projectMutator.addRootComponent()}
        class="btn block"
        ><KbdShortcutSpan
          label="Add Component"
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
      {#if $rootComponents$}
        {#each $rootComponents$ as component (component.id)}
          <div class="divider"></div>
          <RootComponentView {ctx} {component} />
        {/each}
      {/if}
    </div>
  </div>
</div>

<style></style>
