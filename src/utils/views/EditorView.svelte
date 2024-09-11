<script lang="ts">
  import { ResizeSensor } from "css-element-queries";
  import { map, mergeAll, of, ReplaySubject, switchMap } from "rxjs";

  import { ProjectCtx } from "src/ctx/ProjectCtx";
  import type { ExObject } from "src/ex-object/ExObject";
  import { DexRuntime } from "src/utils/utils/DexRuntime";
  import { RxFns } from "src/utils/utils/Utils";
  import RootExObjectView from "src/utils/views/RootExObjectView.svelte";
  import { onMount } from "svelte";
  import { Constants } from "../utils/ViewUtils";
  import FlexContainer from "./FlexContainer.svelte";
  import KbdShortcutSpan from "./KbdShortcutSpan.svelte";
  import { LibraryCtx } from "src/ctx/LibraryCtx";
  import { Library } from "src/ex-object/Library";
  import { Effect } from "effect";
  import { Project } from "src/ex-object/Project";
  import { log5 } from "src/utils/utils/Log5";

  // @ts-ignore
  const log55 = log5("EditorView.svelte");

  let rootExObjects: ExObject[];

  RxFns.onMount$().pipe(
    switchMap(async () => {
      const project = await DexRuntime.runPromise(ProjectCtx.activeProject);
      return project.rootExObjects.items$;
    }),
    mergeAll(),
    map((rootExObjects2) => {
      rootExObjects = rootExObjects2;
    })
  );

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

  const newActionsFocused$ = of(false);

  async function handleClickNewProject() {
    DexRuntime.runPromise(
      Effect.gen(function* () {
        const library = yield* LibraryCtx.library;
        Library.Methods(library).addProjectBlank();
      })
    );
  }

  function addRootExObjectBlank() {
    DexRuntime.runPromise(ProjectCtx.activeProject).then((project) => {
      Project.Methods(project).addRootExObjectBlank();
    });
  }
</script>

<div bind:this={rootElement} class="w-max min-w-full">
  <FlexContainer>
    <div class="flex gap-4 {Constants.WindowPaddingClass}">
      <button on:click={addRootExObjectBlank} class="btn block"
        ><KbdShortcutSpan
          label="Add Object"
          showShortcut={$newActionsFocused$}
          underlineCharIndex={4}
        /></button
      >
      <button on:click={handleClickNewProject} class="btn block">
        <KbdShortcutSpan
          label="New Project"
          showShortcut={$newActionsFocused$}
          underlineCharIndex={4}
        />
      </button>

      <!-- <button on:click={() => ctx.goModule.Evaluator.debug()} class="btn block">
        Debug Evaluator
      </button> -->
    </div>
    <FlexContainer>
      {#if rootExObjects}
        {#each rootExObjects as exObject (exObject.id)}
          <div class="divider w-full m-0 h-0"></div>
          <RootExObjectView {exObject} />
        {/each}
      {/if}
    </FlexContainer>
  </FlexContainer>
</div>
