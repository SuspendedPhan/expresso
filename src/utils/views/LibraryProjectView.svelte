<script lang="ts">
  import { Effect, Stream } from "effect";
  import { of } from "rxjs";
  import { LibraryProjectCtx } from "src/ctx/LibraryProjectCtx";
  import type { LibraryProject } from "src/ex-object/LibraryProject";
  import { DexRuntime } from "src/utils/utils/DexRuntime";
  import ExObjectButton from "src/utils/views/ExObjectButton.svelte";

  export let project: LibraryProject;
  const selected$ = of(false);

  let name: string;
  DexRuntime.runPromise(
    Effect.gen(function* () {
      yield* Stream.runForEach(project.name.changes, (name_) => {
        return Effect.gen(function* () {
          name = name_;
        });
      });
    })
  );

  function onClick() {
    DexRuntime.runPromise(
      Effect.gen(function* () {
        const libraryProjectCtx = yield* LibraryProjectCtx;
        libraryProjectCtx.activeLibraryProject$.next(project);
      })
    );
  }
</script>

<tr class:ring={$selected$}>
  <td>{project.id}</td>
  <td>{name}</td>
  <td><ExObjectButton on:click={onClick}>Open</ExObjectButton></td>
</tr>
