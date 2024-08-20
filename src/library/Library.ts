import { Subject } from "rxjs";
import type { LibraryProject } from "src/library/LibraryProject";
import type MainContext from "src/main-context/MainContext";
import { createBehaviorSubjectWithLifetime } from "src/utils/utils/Utils";

export type Library = ReturnType<typeof createLibrary>;

export function createLibrary(_ctx: MainContext, data: {
  projectOrdinal?: number;
  libraryProjectArr?: LibraryProject[];
}) {
  const destroy$ = new Subject<void>();
  return {
    projectOrdinal$: createBehaviorSubjectWithLifetime(destroy$, data.projectOrdinal ?? 0),
    libraryProjectArr$: createBehaviorSubjectWithLifetime(destroy$, data.libraryProjectArr ?? []),

    destroy$,


  };
}