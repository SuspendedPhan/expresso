import { Option } from "effect";
import type { Draft } from "mutative";
import type { AppState } from "./AppState";
import { DexData } from "./DexData";
import type { SelectionRange } from "./TextField";
import assert from "assert-ts";

export type DexFocus = DexBasicFocus | DexTextFieldFocus;

export type EditingState = NotEditing | TextFieldEditing;

export interface NotEditing {
  _tag: "NotEditing";
}

export interface TextFieldEditing {
  _tag: "TextFieldEditing";
  selection: SelectionRange;
}

export interface DexBasicFocus {
  readonly _tag: "DexFocus";
  readonly target: DexFocusTarget;
  readonly editingState: NotEditing;
}

export interface DexTextFieldFocus {
  readonly _tag: "DexTextFieldFocus";
  readonly target: TextFieldFocusTarget;
  readonly editingState: TextFieldEditing | NotEditing;
}

export interface DexComboboxFocus {
  readonly _tag: "DexComboboxFocus";
  readonly targetId: string;
  readonly options: string[];
  readonly focusedIndex: number;
}

export enum FocusKind {
  "Object_Name",
  "Object_Component",
  "Property_Name",
  "Expr",
  "Command_New",
}

export type TextFieldFocusKind = FocusKind.Object_Name | FocusKind.Property_Name;

export const DexFocus = DexData.tagged<DexFocus>("DexFocus");

export interface BasicFocusTarget {
  _tag: "BasicFocusTarget";
  kind: FocusKind;
  targetId: string;
}

export interface TextFieldFocusTarget {
  _tag: "TextFieldFocusTarget";
  targetId: string;
  kind: TextFieldFocusKind;
}

export type DexFocusTarget = BasicFocusTarget | TextFieldFocusTarget;

export const FocusReducer = {
  setFocusNone() {
    return (appState: Draft<AppState>) => {
      appState.focus = Option.none();
    };
  },

  cancelEdit() {
    return (appState: Draft<AppState>) => {
      appState.focus.pipe(
        Option.filter((focus) => focus.editingState._tag !== "NotEditing"),
        Option.map(() => {
          appState.focusStack.pop();
          const focus = appState.focusStack[appState.focusStack.length - 1];
          assert(focus !== undefined, "Focus stack should never be empty");
          appState.focus = Option.some(focus);
        })
      );
    };
  },
};
