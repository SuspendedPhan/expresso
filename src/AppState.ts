import { Option } from "effect";
import { DexData } from "./DexData";
import { DexProjectId, type DexComponent, type DexFunction, type DexProject, type PartialCaseArgs } from "./DexDomain";

// --- State ---

export interface AppState {
  readonly _tag: "AppState";
  readonly activeWindow: DexWindow;
  readonly focus: Option.Option<DexFocus>;
  readonly projects: DexProject[];
  readonly activeProjectId: Option.Option<DexProjectId>;
}

export interface DexFocus {
  readonly _tag: "DexFocus";
  readonly targetId: string;
  readonly isEditing: boolean;
}

export type DexWindow =
  | LoadingHome
  | ProjectEditorHome
  | ProjectComponentHome
  | ProjectFunctionHome
  | LibraryProjectHome
  | LibraryComponentHome
  | LibraryFunctionHome;

export interface LoadingHome {
  readonly _tag: "LoadingHome";
}

export interface ProjectEditorHome {
  readonly _tag: "ProjectEditorHome";
}

export interface ProjectComponentHome {
  readonly _tag: "ProjectComponentHome";
  readonly dexComponents: DexComponent[];
}

export interface ProjectFunctionHome {
  readonly _tag: "ProjectFunctionHome";
  readonly dexFunctions: DexFunction[];
}

export interface LibraryProjectHome {
  readonly _tag: "LibraryProjectHome";
  // TODO
}

export interface LibraryComponentHome {
  readonly _tag: "LibraryComponentHome";
  // TODO
}

export interface LibraryFunctionHome {
  readonly _tag: "LibraryFunctionHome";
  // TODO
}

export const AppState = DexData.tagged<AppState>("AppState");
export const DexFocus = DexData.tagged<DexFocus>("DexFocus");
export const LoadingHome = DexData.tagged<LoadingHome>("LoadingHome");
export const ProjectEditorHome = DexData.tagged<ProjectEditorHome>("ProjectEditorHome");
export const ProjectComponentHome = DexData.tagged<ProjectComponentHome>("ProjectComponentHome");
export const ProjectFunctionHome = DexData.tagged<ProjectFunctionHome>("ProjectFunctionHome");
export const LibraryProjectHome = DexData.tagged<LibraryProjectHome>("LibraryProjectHome");
export const LibraryComponentHome = DexData.tagged<LibraryComponentHome>("LibraryComponentHome");

export function makeAppState(args: PartialCaseArgs<typeof AppState>): AppState {
  const args2 = {
    activeWindow: args.activeWindow ?? LoadingHome(),
    focus: args.focus ?? Option.none(),
    projects: args.projects ?? [],
    activeProjectId: args.activeProjectId ?? Option.none(),
  };
  return AppState(args2);
}
