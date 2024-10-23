import { Option } from "effect";
import type { Draft } from "mutative";
import { match } from "ts-pattern";
import type { AppState } from "./AppState";
import { DexData } from "./DexData";
import type { SelectionRange } from "./TextField";

export enum FocusKind {
  "Object_Name",
  "Object_Component",
  "Property_Name",
  "Expr",
  "Command_New",
}

export type DexFocus = DexBasicFocus | DexTextFieldEditingFocus | DexComboboxEditingFocus;
export type DexFocusTarget = BasicFocusTarget | TextFieldFocusTarget;
export type TextFieldFocusKind = FocusKind.Object_Name | FocusKind.Property_Name;
export type ComboboxFocusKind = FocusKind.Object_Component | FocusKind.Expr;

export interface DexBasicFocus {
  readonly _tag: "DexFocus";
  readonly target: DexFocusTarget;
}

export interface DexTextFieldEditingFocus {
  readonly _tag: "DexTextFieldFocus";
  readonly target: TextFieldFocusTarget;
  readonly selection: SelectionRange;
}

export interface DexComboboxEditingFocus {
  readonly _tag: "DexComboboxFocus";
  readonly target: DexFocusTarget;
  readonly options: string[];
  readonly focusedIndex: number;
}

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

export interface ComboboxFocusTarget {
  _tag: "ComboboxFocusTarget";
  targetId: string;
  kind: ComboboxFocusKind;
}

export const DexFocus = DexData.tagged<DexFocus>("DexFocus");

export const FocusReducer = {
  setFocusNone() {
    return this.setFocus(Option.none());
  },

  setFocus(focus: Option.Option<DexFocus>) {
    return (appState: Draft<AppState>) => {
      focus.pipe(
        Option.map((focus) => {
          appState.focusStack.push(focus);
        })
      );
      appState.focus = focus;
    };
  },

  focusTarget(target: DexFocusTarget) {
    return (appState: Draft<AppState>) => {
      const focus = match(target)
        .with({ _tag: "BasicFocusTarget" }, (target) => {
          const focus: DexBasicFocus = {
            _tag: "DexFocus",
            target,
            editingState: { _tag: "NotEditing" },
          };
          return focus;
        })
        .with({ _tag: "TextFieldFocusTarget" }, (target) => {
          const focus: DexTextFieldFocus = {
            _tag: "DexTextFieldFocus",
            target,
            editingState: { _tag: "NotEditing" },
          };
          return focus;
        })
        .exhaustive();

      this.setFocus(Option.some(focus))(appState);
    };
  },

  cancelEdit() {
    return (appState: Draft<AppState>) => {
      const focus = Option.getOrNull(appState.focus);
      if (focus === null) {
        return;
      }

      focus.editingState = { _tag: "NotEditing" };
    };
  },
};
