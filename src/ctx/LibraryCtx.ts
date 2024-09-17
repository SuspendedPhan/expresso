import { Effect, Layer } from "effect";
import { BehaviorSubject, ReplaySubject, Subject } from "rxjs";
import { LibraryFactory, type Library } from "src/ex-object/Library";
import type { LibraryProject } from "src/ex-object/LibraryProject";
import { EffectUtils } from "src/utils/utils/EffectUtils";
import {
  createObservableArrayWithLifetime,
  ObservableArray,
} from "src/utils/utils/ObservableArray";

export class LibraryCtx extends Effect.Tag("LibraryCtx")<
  LibraryCtx,
  Effect.Effect.Success<typeof ctxEffect>
>() {}

interface LibraryCreationArgs {
  projectOrdinal?: number;
  libraryProjects?: LibraryProject[];
}

const ctxEffect = Effect.gen(function* () {
  const library$ = new ReplaySubject<Library>(1);
  library$.next(yield* factory({}));

  function factory(creationArgs: LibraryCreationArgs) {
    return Effect.gen(function* () {
      const creationArgs2: Required<LibraryCreationArgs> = {
        projectOrdinal: creationArgs.projectOrdinal ?? 0,
        libraryProjects: creationArgs.libraryProjects ?? [],
      };

      const destroy$ = new Subject<void>();

      const libraryProjects = createObservableArrayWithLifetime<LibraryProject>(
        destroy$,
        creationArgs2.libraryProjects
      );

      const libraryProjectById = new Map();
      ObservableArray.syncMap(
        libraryProjectById,
        libraryProjects,
        (item) => item.id
      );

      const library = LibraryFactory({
        projectOrdinal$: new BehaviorSubject<number>(
          creationArgs2.projectOrdinal
        ),
        libraryProjects,
        destroy$,
        libraryProjectById,
      });

      library$.next(library);
      return library;
    });
  }

  return {
    library$,
    get library() {
      return Effect.gen(this, function* () {
        return yield* EffectUtils.firstValueFrom(this.library$);
      });
    },

    factory,
  };
});

export const LibraryCtxLive = Layer.effect(LibraryCtx, ctxEffect);
