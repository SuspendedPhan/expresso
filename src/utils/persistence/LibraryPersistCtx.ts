import { Effect, Layer } from "effect";

export class LibraryPersistCtx extends Effect.Tag("LibraryPersistCtx")<
  LibraryPersistCtx,
  Effect.Effect.Success<typeof ctxEffect>
>() {}

const ctxEffect = Effect.gen(function* () {
  return {
    readProjects(): Effect.Effect<string[]> {
      return Effect.gen(function* () {
        throw new Error("Not implemented");
      });
    },

    writeProject(libraryProjectId: string, projectBlob: string): Effect.Effect<void> {
      return Effect.gen(function* () {
        throw new Error("Not implemented");
      });
    },

    readActiveLibraryProjectId(): Effect.Effect<string> {
      return Effect.gen(function* () {
        throw new Error("Not implemented");
      });
    },

    writeActiveLibraryProjectId(libraryProjectId: string): Effect.Effect<void> {
      return Effect.gen(function* () {
        throw new Error("Not implemented");
      });
    }
  };
});

export const ReadCtxLive = Layer.effect(LibraryPersistCtx, ctxEffect);