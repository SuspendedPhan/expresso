<script lang="ts">
  import { ResizeSensor } from "css-element-queries";
  import MainContext from "src/main-context/MainContext";
  import { onMount } from "svelte";
  import RootComponentView from "./RootComponentView.svelte";
  import { combineLatest, map, ReplaySubject, switchMap } from "rxjs";

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
        return 0;
      } else {
        return largestWidth / 2 - width / 2;
      }
    })
  );
</script>

<div class=" overflow-scroll" bind:this={rootElement}>
  <div
    class="flex flex-col items-center p-8"
    style:transform="translateX(calc({$xTranslation$}px + 2rem))"
  >
    <div class="flex gap-4">
      <button on:click={() => ctx.projectMutator.addRootComponent()} class="btn"
        >Add Component</button
      >
      <button on:click={() => ctx.projectMutator.newProject()} class="btn"
        >New Project</button
      >
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
