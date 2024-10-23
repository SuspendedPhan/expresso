import { Option } from "effect";
import { DexData } from "./DexData";
import { DexGetter } from "./DexGetter";

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

export enum FocusKind {
  "Object_Name",
  "Object_Component",
  "Property_Name",
  "Expr",
}

export type TextFieldFocusKind = FocusKind.Object_Name | FocusKind.Property_Name;

export const DexFocus = DexData.tagged<DexFocus>("DexFocus");

export const DexFocusGetter = {
    textFieldValue: (focus: DexTextFieldFocus): string => {
        switch (focus.kind) {
            case FocusKind.Object_Name:
                return DexGetter.DexObject.get(focus.targetId).name;
            case FocusKind.Property_Name:
                return DexGetter.DexProperty.get(focus.targetId).name;
            default:
                throw new Error("Invalid focus kind");
        }
    }
}