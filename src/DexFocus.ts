import { Option } from "effect";
import type { Draft } from "mutative";
import { match } from "ts-pattern";
import type { AppState } from "./AppState";
import { DexData } from "./DexData";
import { TextFieldGetter, type SelectionRange } from "./TextField";
import assert from "assert-ts";

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
export const BasicFocusTarget = DexData.tagged<BasicFocusTarget>("BasicFocusTarget");
export const TextFieldFocusTarget = DexData.tagged<TextFieldFocusTarget>("TextFieldFocusTarget");
export const ComboboxFocusTarget = DexData.tagged<ComboboxFocusTarget>("ComboboxFocusTarget");

export const FocusReducer = {
  tryStartEditing() {
    return (appState: Draft<AppState>) => {
      const focus = Option.getOrThrow(appState.focus);
      if (focus._tag !== "DexFocus") {
        return;
      }
      if (focus.target._tag === "BasicFocusTarget") {
        return;
      }
      match(focus.target)
        .with({ _tag: "TextFieldFocusTarget" }, (target) => {
          const value = TextFieldGetter.textFieldValue(appState, target);
          const editingFocus: DexTextFieldEditingFocus = {
            _tag: "DexTextFieldFocus",
            target,
            selection: {
              start: 0,
              end: value.length,
            },
          };
          this.setFocus(Option.some(editingFocus))(appState);
        })
        .exhaustive();
    };
  },

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
          };
          return focus;
        })
        .with({ _tag: "TextFieldFocusTarget" }, (target) => {
          const focus: DexBasicFocus = {
            _tag: "DexFocus",
            target,
          };
          return focus;
        })
        .exhaustive();

      this.setFocus(Option.some(focus))(appState);
    };
  },

  tryCancelEdit() {
    return (appState: Draft<AppState>) => {
      const focus = Option.getOrNull(appState.focus);
      if (focus === null) {
        return;
      }

      if (focus._tag === "DexFocus") {
        return;
      }

      appState.focusStack.pop();
      const newFocus = appState.focusStack.pop();
      assert(newFocus !== undefined);
      this.setFocus(Option.some(newFocus))(appState);
    };
  },
};
