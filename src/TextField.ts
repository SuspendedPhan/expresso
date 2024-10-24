import { Option } from "effect";

import type { AppState } from "./AppState";
import { DexBasicPropertyId, DexObjectId } from "./DexDomain";
import { FocusKind, type TextFieldFocusKind, type TextFieldFocusTarget } from "./DexFocus";
import { DexGetter } from "./DexGetter";
import { DexReducer } from "./DexReducer";
import assert from "assert-ts";
import type { Draft } from "mutative";

export interface TextFieldState {
  label: string | undefined;
}

export interface SelectionRange {
  start: number | null;
  end: number | null;
}

export interface HugInputState {
  value: string;
  selection: Option.Option<SelectionRange>;
  readonly: boolean;
}

export const TextFieldReducer = {
  updateValue(props: TextFieldFocusTarget, event: Event) {
    return (appState: Draft<AppState>) => {
      const value = (event.target as HTMLInputElement).value;
      const selectionStart = (event.target as HTMLInputElement).selectionStart;
      const selectionEnd = (event.target as HTMLInputElement).selectionEnd;
      const selectionRange: SelectionRange = { start: selectionStart, end: selectionEnd };
      const focus = Option.getOrThrow(appState.focus);
      assert(focus._tag === "DexTextFieldFocus", "Expected DexTextFieldFocus");
      focus.selection = selectionRange;

      switch (props.kind) {
        case FocusKind.Object_Name:
          DexReducer.DexObject.setName(DexObjectId(props.targetId), value)(appState);
          break;
        case FocusKind.Property_Name:
          DexReducer.DexBasicProperty.setName(DexBasicPropertyId(props.targetId), value)(appState);
          break;
        default:
          throw new Error("Invalid focus kind");
      }
    };
  },
};

function getLabel(kind: TextFieldFocusKind): string | undefined {
  switch (kind) {
    case FocusKind.Object_Name:
      return "Name";
    case FocusKind.Property_Name:
      return undefined;
    default:
      throw new Error("Invalid focus kind");
  }
}

export const TextFieldGetter = {
  state(target: TextFieldFocusTarget): TextFieldState {
    const label = getLabel(target.kind);
    const state: TextFieldState = { label };
    return state;
  },

  hugInputState(appState: AppState, target: TextFieldFocusTarget): HugInputState {
    const focus = appState.focus;
    const editingFocus = focus.pipe(
      Option.filter((focus) => focus._tag === "DexTextFieldFocus"),
      Option.filter((f) => f.target.kind === target.kind && f.target.targetId === target.targetId)
    );
    const isEditing = editingFocus.pipe(Option.isSome);
    const readonly = !isEditing;
    const selection = editingFocus.pipe(Option.map((f) => f.selection));
    const value = TextFieldGetter.textFieldValue(appState, target);
    return { value, selection, readonly };
  },

  textFieldValue(appState: AppState, target: TextFieldFocusTarget): string {
    const { kind, targetId } = target;
    switch (kind) {
      case FocusKind.Object_Name:
        return DexGetter.DexObject.get(appState, targetId).name;
      case FocusKind.Property_Name:
        return DexGetter.DexBasicProperty.get(appState, targetId).name;
      default:
        throw new Error("Invalid focus kind");
    }
  },
};
