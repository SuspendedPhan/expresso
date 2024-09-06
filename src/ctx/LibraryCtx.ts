import { Context, Effect, Layer } from "effect";
import {
  BehaviorSubject,
  ReplaySubject,
  switchMap,
  type Observable,
} from "rxjs";
import type { Project } from "src/ex-object/Project";
import type { LibraryProject } from "src/library/LibraryProject";
import type { SUB } from "src/utils/utils/Utils";

export class LibraryCtx extends Context.Tag("LibraryCtx")<
  LibraryCtx,
  {
    libraryProjects$: SUB<readonly LibraryProject[]>;
    activeLibraryProject$: Observable<LibraryProject>;
    activeProject$: Observable<Project>;
  }
>() {}

export const LibraryCtxLive = Layer.effect(
  LibraryCtx,
  Effect.gen(function* () {
    const activeLibraryProject$ = new ReplaySubject<LibraryProject>(1);
    return {
      libraryProjects$: new BehaviorSubject<readonly LibraryProject[]>([]),
      activeLibraryProject$,
      activeProject$: activeLibraryProject$.pipe(
        switchMap((libraryProject) => libraryProject.project$)
      ),
    };
  })
);
