<script lang="ts">
  import { ResizeSensor } from "css-element-queries";
  import { of, ReplaySubject, switchAll, switchMap } from "rxjs";

  import { Effect } from "effect";

  import { EditorAction } from "src/actions/EditorAction";
  import type { ExObject } from "src/ex-object/ExObject";
  import { Project } from "src/ex-object/Project";
  import { DexRuntime } from "src/utils/utils/DexRuntime";
  import { log5 } from "src/utils/utils/Log5";
  import { RxFns } from "src/utils/utils/Utils";
  import RootExObjectView from "src/utils/views/RootExObjectView.svelte";
  import { onMount } from "svelte";
  import { Constants } from "../utils/ViewUtils";
  import FlexContainer from "./FlexContainer.svelte";
  import KbdShortcutSpan from "./KbdShortcutSpan.svelte";

  // @ts-ignore
  const log55 = log5("EditorView.svelte");

  let rootExObjects: ExObject[];

  RxFns.onMount$()
    .pipe(
      switchMap(() => {
        log55.debug("onMount");
        return DexRuntime.runPromise(Project.activeProject$);
      }),
      switchAll(),
      switchMap((project) => {
        log55.debug("project", project);
        return project.rootExObjects.items$;
      })
    )
    .subscribe((rootExObjects2) => {
      log55.debug("rootExObjects2", rootExObjects2);
      rootExObjects = rootExObjects2;
    });

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

  function handleClickNewProject() {
    DexRuntime.runPromise(EditorAction.newProject());
  }

  function addRootExObjectBlank() {
    log55.debug("addRootExObjectBlank");

    DexRuntime.runPromise(
      Effect.gen(function* () {
        const activeProject = yield* Project.activeProject;
        yield* Project.Methods(activeProject).addRootExObjectBlank();
      })
    );
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
