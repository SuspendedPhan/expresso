import { Effect, Layer } from "effect";
import type { DehydratedProject } from "src/hydration/Dehydrator";
import { RehydratorCtx } from "src/hydration/Rehydrator";
import { Persist00Ctx } from "src/utils/persistence/GCloudPersist00Ctx";
import { log5 } from "src/utils/utils/Log5";

const log55 = log5("PersistCtx0.ts");

export interface DehydratedLibraryProject {
  id: string;
  name: string;
}

export class Persist0Ctx extends Effect.Tag("PersistCtx0")<
  Persist0Ctx,
  Effect.Effect.Success<typeof ctxEffect>
>() {}

const ctxEffect = Effect.gen(function* () {
  const rehydratorCtx = yield* RehydratorCtx;
  const gCloudPersistence = yield* Persist00Ctx;

  return {
    readProject(libraryProjectId: string) {
      return Effect.gen(function* () {
        const filePath = `projects/${libraryProjectId}.json`;
        const fileContent = yield* gCloudPersistence.readFile(filePath);

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
        const project = yield* rehydratorCtx.rehydrateProject(
          dehydratedProject
        );

        log55.debug("Rehydrated project:", project);

        // Return the rehydrated library project
        return project;
      });
    },

    writeProject(
      libraryProjectId: string,
      dehydratedProject: DehydratedProject
    ): Effect.Effect<void, void, never> {
      return Effect.gen(function* () {
        const filePath = `projects/${libraryProjectId}.json`;
        const fileContent = JSON.stringify(dehydratedProject);
        yield* gCloudPersistence.writeFile(filePath, fileContent);
      });
    },

    readActiveLibraryProjectId() {
      return Effect.gen(function* () {
        const fileContent = yield* gCloudPersistence.readFile(
          "activeLibraryProjectId"
        );
        return fileContent;
      });
    },

    writeActiveLibraryProjectId(id: string) {
      return gCloudPersistence.writeFile("activeLibraryProjectId", id);
    },

    readLibraryProjectList() {
      return Effect.gen(function* () {
        const result: DehydratedLibraryProject[] = [];
        const filepath = yield* gCloudPersistence.listFiles("projects");
        for (const filename of filepath) {
          // Extract id (everything before the first underscore)
          const id = filename.substring(0, filename.indexOf("_"));

          // Extract name (everything between the first underscore and the last dot
          const name = filename.substring(
            filename.indexOf("_") + 1,
            filename.lastIndexOf(".")
          );

          result.push({ id, name });
        }
        return result;
      });
    },
  };
});

export const PersistCtx0Live = Layer.effect(Persist0Ctx, ctxEffect);
