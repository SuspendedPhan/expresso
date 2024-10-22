import { Data, Option } from "effect";
import type { DexComponent, DexFunction, DexProject } from "./Domain";

// --- State ---

export interface AppState {
  readonly activeWindow: DexWindow;
  readonly focus: Option.Option<DexFocus>;
}

export interface DexFocus {
  readonly _tag: "DexFocus";
  readonly target: any;
  readonly isEditing: boolean;
}

export type DexWindow =
  | ProjectEditorHome
  | ProjectComponentHome
  | ProjectFunctionHome
  | LibraryProjectHome
  | LibraryComponentHome
  | LibraryFunctionHome;

export interface ProjectEditorHome {
  readonly _tag: "ProjectEditorHome";
  readonly dexProject: DexProject;
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


export const DexFocus = Data.tagged<DexFocus>("DexFocus");
export const ProjectEditorHome = Data.tagged<ProjectEditorHome>("ProjectEditorHome");