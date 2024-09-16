import { Effect } from "effect";
import type { LibraryProject } from "src/ex-object/LibraryProject";
import type { Project } from "src/ex-object/Project";
import createRehydrator from "src/hydration/Rehydrator";
import Persistence from "src/utils/persistence/Persistence";

export const Persistence2 = {
  readLibraryProject(id: string): Effect.Effect<Project> {
    /*
    read the file from Persistence
    decode file to dehydratedObject
    rehydrate the object
    return the rehydrated object
    */
  },

  writeLibraryProject(project: LibraryProject) {
  },

  listLibraryProjects(): Effect.Effect<LibraryProject[]> {
    throw new Error("Not implemented");
  },
};
