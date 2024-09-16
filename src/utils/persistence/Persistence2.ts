import { Effect } from "effect";
import type { UnknownException } from "effect/Cause";
import type { ComponentCtx } from "src/ctx/ComponentCtx";
import type { ExObjectCtx } from "src/ctx/ExObjectCtx";
import type { ExprCtx } from "src/ctx/ExprCtx";
import type { LibraryCtx } from "src/ctx/LibraryCtx";
import type { LibraryProjectCtx } from "src/ctx/LibraryProjectCtx";
import type { PropertyCtx } from "src/ctx/PropertyCtx";
import type { Project } from "src/ex-object/Project";
import type { DehydratedProject } from "src/hydration/Dehydrator";
import createRehydrator from "src/hydration/Rehydrator";
import GCloudPersistence from "src/utils/persistence/GCloudPersistence";
import { log5 } from "src/utils/utils/Log5";

const log55 = log5("Persistence2.ts");

export const Persistence2 = {
  readProject(
    libraryProjectId: string
  ): Effect.Effect<
    Project | null,
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
      const project = yield* rehydrator.rehydrateProject(dehydratedProject);

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
      const gCloudPersistence = new GCloudPersistence();
      const filePath = `projects/${libraryProjectId}.json`;
      const fileContent = JSON.stringify(dehydratedProject);
      yield* Effect.tryPromise(() =>
        gCloudPersistence.writeFile(filePath, fileContent)
      );
    });
  },
};
