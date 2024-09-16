import { Effect } from "effect";
import type { UnknownException } from "effect/Cause";
import type { ComponentCtx } from "src/ctx/ComponentCtx";
import type { ExObjectCtx } from "src/ctx/ExObjectCtx";
import type { ExprCtx } from "src/ctx/ExprCtx";
import type { LibraryCtx } from "src/ctx/LibraryCtx";
import type { LibraryProjectCtx } from "src/ctx/LibraryProjectCtx";
import type { PropertyCtx } from "src/ctx/PropertyCtx";
import { LibraryProject } from "src/ex-object/LibraryProject";
import type { DehydratedProject } from "src/hydration/Dehydrator";
import createRehydrator from "src/hydration/Rehydrator";
import GCloudPersistence from "src/utils/persistence/GCloudPersistence";
import { log5 } from "src/utils/utils/Log5";

const log55 = log5("Persistence2.ts");

export const Persistence2 = {
  readLibraryProject(
    id: string
  ): Effect.Effect<
    LibraryProject,
    UnknownException,
    | LibraryCtx
    | ExprCtx
    | LibraryProjectCtx
    | PropertyCtx
    | ComponentCtx
    | ExObjectCtx
  > {
    return Effect.gen(function* () {
      // Create instances
      const gCloudPersistence = new GCloudPersistence();
      const rehydrator = createRehydrator();

      // Read the file from GCloudPersistence
      const filePath = `projects/${id}.json`;
      const fileContent = yield* Effect.tryPromise(() =>
        gCloudPersistence.readFile(filePath)
      );

      if (fileContent === null) {
        return yield* Effect.die(
          new Error(`Project file not found: ${filePath}`)
        );
      }

      // JSON decode and cast to DehydratedProject
      let dehydratedProject: DehydratedProject;
      try {
        dehydratedProject = JSON.parse(fileContent) as DehydratedProject;
      } catch (error) {
        return yield* Effect.die(
          new Error(`Failed to parse project file: ${error}`)
        );
      }

      log55.debug("Dehydrated project:", dehydratedProject);

      // Rehydrate the object
      const libraryProject = yield* rehydrator.rehydrateProject(
        dehydratedProject
      );

      log55.debug("Rehydrated library project:", libraryProject);

      // Return the rehydrated library project
      return libraryProject;
    });
  },

  writeLibraryProject(
    libraryProjectId: string,
    dehydratedProject: DehydratedProject
  ): Effect.Effect<void, Error, never> {
    return Effect.gen(function* () {
      const gCloudPersistence = new GCloudPersistence();
      const filePath = `projects/${libraryProjectId}.json`;
      const fileContent = JSON.stringify(dehydratedProject);
      yield* Effect.tryPromise(() =>
        gCloudPersistence.writeFile(filePath, fileContent)
      );
    });
  },
};
