import { Effect } from "effect";
import { ReplaySubject } from "rxjs";
import { LibraryCtx } from "src/ctx/LibraryCtx";
import { ProjectFactory2, type Project } from "src/ex-object/Project";
import { EffectUtils } from "src/utils/utils/EffectUtils";
import { Utils } from "src/utils/utils/Utils";
import { fields, variation } from "variant";

export interface LibraryProject_ {
  id: string;
  name: string;
  project$: ReplaySubject<Project>;
}

export const LibraryProjectFactory = variation(
  "LibraryProject",
  fields<LibraryProject_>()
);
export type LibraryProject = ReturnType<typeof LibraryProjectFactory>;

export interface LibraryProjectCreationArgs {
  id?: string;
  name?: string;
  project?: Project | null;
  ordinal?: number;
}

export function LibraryProjectFactory2(
  creationArgs: LibraryProjectCreationArgs
) {
  return Effect.gen(function* () {
    const libraryCtx = yield* LibraryCtx;
    const library = yield* libraryCtx.library;

    const ordinal =
      creationArgs.ordinal ??
      (yield* EffectUtils.firstValueFrom(library.projectOrdinal$));

    const creationArgs2: Required<LibraryProjectCreationArgs> = {
      id: creationArgs.id ?? Utils.createId("library-project"),
      name: creationArgs.name ?? `Project ${ordinal}`,
      project: creationArgs.project ?? null,
      ordinal,
    };

    const project$ = new ReplaySubject<Project>(1);
    const libraryProject: LibraryProject = LibraryProjectFactory({
      id: creationArgs2.id,
      name: creationArgs2.name,
      project$,
    });

    let project = creationArgs2.project;
    if (project === null) {
      project = yield* ProjectFactory2({});
    }
    
    project$.next(project);
    project.libraryProject = libraryProject;

    return libraryProject;
  });
}

export const LibraryProject = {
  Methods: (_libraryProject: LibraryProject) => ({}),
};
