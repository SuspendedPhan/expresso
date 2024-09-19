import { Effect, Layer, Option } from "effect";
import { PersistCtx } from "src/utils/persistence/GCloudPersist00Ctx";
import { log5 } from "src/utils/utils/Log5";

const log55 = log5("LibraryPersistCtx.ts");

export class LibraryPersistCtx extends Effect.Tag("LibraryPersistCtx")<
  LibraryPersistCtx,
  Effect.Effect.Success<typeof ctxEffect>
>() {}

const ctxEffect = Effect.gen(function* () {
  const persistCtx = yield* PersistCtx;

  return {
    readProjects(): Effect.Effect<string[], void, never> {
      return Effect.gen(function* () {
        log55.debug("Reading projects");
        // TODO: read all projects
        const filenames = yield* persistCtx.listFiles("projects");
        const encodedProjects = new Array<string>();
        for (const filename of filenames) {
          const encodedProject_ = yield* persistCtx.readFile(`projects/${filename}`);
          const encodedProject = yield* Option.match(encodedProject_, {
            onSome: (file) => Effect.succeed(file),
            onNone: () => {
              log55.error("File not found", filename);
              return Effect.fail("File not found");
            }
          });
          encodedProjects.push(encodedProject);
        }
        return encodedProjects;
      });
    },

    writeProject(libraryProjectId: string, projectBlob: string): Effect.Effect<void, void, never> {
      return Effect.gen(function* () {
        log55.debug("Writing project", libraryProjectId);
        return yield* persistCtx.writeFile(`projects/${libraryProjectId}`, projectBlob);
      });
    },

    readActiveLibraryProjectId(): Effect.Effect<Option.Option<string>, void, never> {
      return Effect.gen(function* () {
        log55.debug("Reading active library project ID");
        return yield* persistCtx.readFile("activeLibraryProjectId");
      });
    },

    writeActiveLibraryProjectId(libraryProjectId: string): Effect.Effect<void, void, never> {
      return Effect.gen(function* () {
        log55.debug("Writing active library project ID", libraryProjectId);
        return yield* persistCtx.writeFile("activeLibraryProjectId", libraryProjectId);
      });
    }
  };
});

export const LibraryPersistCtxLive = Layer.effect(LibraryPersistCtx, ctxEffect);