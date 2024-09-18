import { Effect, Layer } from "effect";
import type { DehydratedLibraryProject } from "src/hydration/Dehydrator";
import { RehydratorCtx } from "src/hydration/Rehydrator";
import { EncodeCtx } from "src/utils/persistence/EncodeCtx";
import { LibraryPersistCtx } from "src/utils/persistence/LibraryPersistCtx";

export class LoadCtx extends Effect.Tag("LoadCtx")<
  LoadCtx,
  Effect.Effect.Success<typeof ctxEffect>
>() {}

const ctxEffect = Effect.gen(function* () {
  const libraryPersistCtx = yield* LibraryPersistCtx;
  const decodeCtx = yield* EncodeCtx;
  const rehydrator = yield* RehydratorCtx;

  const loadEncodedProject = (encodedProject: string) => {
    return Effect.gen(function* () {
      const decodedProject = yield* decodeCtx.decode<DehydratedLibraryProject>(
        encodedProject
      );
      return yield* rehydrator.rehydrateLibraryProject(decodedProject);
    });
  };

  return {
    loadProjects() {
      return Effect.gen(function* () {
        const encodedProjects = yield* libraryPersistCtx.readProjects();
        return yield* Effect.all(encodedProjects.map(loadEncodedProject));
      });
    },

    saveProject(project: DehydratedLibraryProject) {
      return Effect.gen(function* () {
        const encodedProject = yield* decodeCtx.encode(project);
        return yield* libraryPersistCtx.writeProject(project.libraryProjectId, encodedProject);
      });
    },
  };
});

export const LoadCtxLive = Layer.effect(LoadCtx, ctxEffect);
