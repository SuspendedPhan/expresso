// File: Library.ts

import { Effect } from "effect";
import { BehaviorSubject, Subject } from "rxjs";
import { LibraryProject, LibraryProjectFactory2 } from "src/ex-object/LibraryProject";
import { ProjectFactory2 } from "src/ex-object/Project";
import {
  type ObservableArray
} from "src/utils/utils/ObservableArray";
import { fields, variation } from "variant";

// const log55 = log5("Library.ts");

interface Library_ {
  projectOrdinal$: BehaviorSubject<number>;
  libraryProjects: ObservableArray<LibraryProject>;
  libraryProjectById: Map<string, LibraryProject>;
  destroy$: Subject<void>;
}

export const LibraryFactory = variation("Library", fields<Library_>());
export type Library = ReturnType<typeof LibraryFactory>;

export const Library = {
  Methods: (library: Library) => ({
    addProjectBlank() {
      return Effect.gen(function* () {
        const ordinal = getAndIncrementOrdinal(library.projectOrdinal$);
        const name = `Project ${ordinal}`;
        const project = yield* ProjectFactory2({});
        const libraryProject = yield* LibraryProjectFactory2({
          project,
          name,
        });
        yield* library.libraryProjects.push(libraryProject);
        return libraryProject;
      });
    },
  }),
};

function getAndIncrementOrdinal(ordinal$: BehaviorSubject<number>) {
  const ordinal = ordinal$.value + 1;
  ordinal$.next(ordinal);
  return ordinal;
}
