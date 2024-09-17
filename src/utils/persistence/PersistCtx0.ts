import { Effect, Layer } from "effect";
import type { DehydratedProject } from "src/hydration/Dehydrator";
import { RehydratorCtx } from "src/hydration/Rehydrator";
import GCloudPersistence from "src/utils/persistence/GCloudPersistence";
import { log5 } from "src/utils/utils/Log5";

const log55 = log5("PersistCtx0.ts");

export class PersistCtx0 extends Effect.Tag("PersistCtx0")<
  PersistCtx0,
  Effect.Effect.Success<typeof ctxEffect>
>() {}

const ctxEffect = Effect.gen(function* () {
  const rehydratorCtx = yield* RehydratorCtx;
  const gCloudPersistence = new GCloudPersistence();

  return {
    readProject(
      libraryProjectId: string
    ) {
      return Effect.gen(function* () {
        const filePath = `projects/${libraryProjectId}.json`;
        const fileContent = yield* Effect.tryPromise(() =>
          gCloudPersistence.readFile(filePath)
        );

        if (fileContent === null) {
          log55.debug("Project file not found");
          return null;
        }

        // JSON decode and cast to DehydratedProject
        let dehydratedProject: DehydratedProject;
        try {
          dehydratedProject = JSON.parse(fileContent) as DehydratedProject;
        } catch (error) {
          log55.debug("Error parsing project file:", error);
          return null;
        }

        log55.debug("Dehydrated project:", dehydratedProject);

        // Rehydrate the object
        const project = yield* rehydratorCtx.rehydrateProject(dehydratedProject);

        log55.debug("Rehydrated project:", project);

        // Return the rehydrated library project
        return project;
      });
    },

    writeProject(
      libraryProjectId: string,
      dehydratedProject: DehydratedProject
    ): Effect.Effect<void, Error, never> {
      return Effect.gen(function* () {
        const filePath = `projects/${libraryProjectId}.json`;
        const fileContent = JSON.stringify(dehydratedProject);
        yield* Effect.tryPromise(() =>
          gCloudPersistence.writeFile(filePath, fileContent)
        );
      });
    },

    readActiveLibraryProjectId() {
      return Effect.gen(function* () {
        const fileContent = yield* Effect.tryPromise(() =>
          gCloudPersistence.readFile("activeLibraryProjectId")
        );

        if (fileContent === null) {
          log55.debug("Active library project ID not found");
          return null;
        }

        return fileContent;
      });
    },

    writeActiveLibraryProjectId(id: string) {
      return Effect.gen(function* () {
        yield* Effect.tryPromise(() =>
          gCloudPersistence.writeFile("activeLibraryProjectId", id)
        );
      });
    }
  };
});

export const PersistCtx0Live = Layer.effect(PersistCtx0, ctxEffect);