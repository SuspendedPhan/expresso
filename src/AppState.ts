import { Data } from "effect";
import type { DexObject, DexComponent, DexFunction } from "./Domain";

// --- State ---

export interface AppState {
  activeWindow: DexWindow;
}

export type DexWindow = Data.TaggedEnum<{
  ProjectEditorHome: ProjectEditorHome;
  ProjectComponentHome: ProjectComponentHome;
  ProjectFunctionHome: ProjectFunctionHome;
  LibraryProjectHome: LibraryProjectHome;
  LibraryComponentHome: LibraryComponentHome;
  LibraryFunctionHome: LibraryFunctionHome;
}>;

export interface ProjectEditorHome {
  dexObjects: DexObject[];
}

export interface ProjectComponentHome {
  dexComponents: DexComponent[];
}

export interface ProjectFunctionHome {
  dexFunctions: DexFunction[];
}

export interface LibraryProjectHome {
  // TODO
}

export interface LibraryComponentHome {
  // TODO
}

export interface LibraryFunctionHome {
  // TODO
}
