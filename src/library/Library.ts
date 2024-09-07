import { Effect } from "effect";
import { BehaviorSubject, Subject } from "rxjs";
import { LibraryCtx } from "src/ctx/LibraryCtx";
import { ProjectFactory2 } from "src/ex-object/Project";
import {
  LibraryProjectFactory2,
  type LibraryProject,
} from "src/library/LibraryProject";
import { log5 } from "src/utils/utils/Log5";
import {
  createObservableArrayWithLifetime,
  type ObservableArray,
} from "src/utils/utils/ObservableArray";
import { fields, variation } from "variant";

const log55 = log5("Library.ts");

interface Library_ {
  projectOrdinal$: BehaviorSubject<number>;
  libraryProjects: ObservableArray<LibraryProject>;
  destroy$: Subject<void>;
}

export const LibraryFactory = variation("Library", fields<Library_>());
export type Library = ReturnType<typeof LibraryFactory>;

interface LibraryCreationArgs {
  projectOrdinal?: number;
  libraryProjects?: LibraryProject[];
}

export function LibraryFactory2(creationArgs: LibraryCreationArgs) {
  return Effect.gen(function* () {
    const libraryCtx = yield* LibraryCtx;

    const creationArgs2: Required<LibraryCreationArgs> = {
      projectOrdinal: creationArgs.projectOrdinal ?? 0,
      libraryProjects: creationArgs.libraryProjects ?? [],
    };

    const library = LibraryFactory({
      projectOrdinal$: new BehaviorSubject<number>(
        creationArgs2.projectOrdinal
      ),
      libraryProjects: createObservableArrayWithLifetime<LibraryProject>(
        new Subject(),
        creationArgs2.libraryProjects
      ),
      destroy$: new Subject<void>(),
    });

    libraryCtx.library$.next(library);
    return library;
  });
}

const Library = {
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
        library.libraryProjects.push(libraryProject);
      });
    },
  }),
};

function getAndIncrementOrdinal(ordinal$: BehaviorSubject<number>) {
  const ordinal = ordinal$.value + 1;
  ordinal$.next(ordinal);
  return ordinal;
}
