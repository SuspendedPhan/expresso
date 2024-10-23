import { Option } from "effect";
import { DexData } from "./DexData";

export type DexFocus = DexBasicFocus | DexTextFieldFocus;

export interface DexBasicFocus {
  readonly _tag: "DexFocus";
  readonly kind: FocusKind;
  readonly targetId: string;
  readonly isEditing: boolean;
}

export interface DexTextFieldFocus {
  readonly _tag: "DexTextFieldFocus";
  readonly kind: TextFieldFocusKind;
  readonly targetId: string;
  readonly isEditing: boolean;
  readonly inputCursorIndex: Option.Option<{
    readonly start: number;
    readonly end: number;
  }>;
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