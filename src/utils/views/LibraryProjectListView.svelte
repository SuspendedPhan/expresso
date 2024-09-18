<script lang="ts">
  import { Effect } from "effect";
  import { DexRuntime } from "src/utils/utils/DexRuntime";
  import { Constants } from "../utils/ViewUtils";
  import LibraryProjectView from "./LibraryProjectView.svelte";
  import { LibraryCtx } from "src/ctx/LibraryCtx";
  import type { LibraryProject } from "src/ex-object/LibraryProject";
  import type { OBS } from "src/utils/utils/Utils";

  let libraryProjects$: OBS<LibraryProject[]>;

  DexRuntime.runPromise(
    Effect.gen(function* () {
      const libraryCtx = yield* LibraryCtx;
      const library = yield* libraryCtx.library;
      libraryProjects$ = library.libraryProjects.items$;
    })
  );
</script>

<div class={Constants.WindowPaddingClass}>
  <table class="table">
    <tbody>
      {#if $libraryProjects$}
        {#each $libraryProjects$ as project}
          <LibraryProjectView {project} />
        {/each}
      {/if}
    </tbody>
  </table>
</div>
