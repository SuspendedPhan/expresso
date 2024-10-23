import type { AppState } from "./AppState";
import { DexBasicPropertyId, DexObjectId } from "./DexDomain";
import { FocusKind, type TextFieldFocusKind } from "./DexFocus";
import { DexGetter } from "./DexGetter";
import { DexReducer } from "./DexReducer";

export interface TextFieldFocusTarget {
  targetId: string;
  kind: TextFieldFocusKind;
}

export interface TextFieldState {
  label?: string;
  value: string;
  isEditing: boolean;
}

export const TextFieldReducer = {
  updateValue(props: TextFieldFocusTarget, event: Event) {
    const value = (event.target as HTMLInputElement).value;
    switch (props.kind) {
      case FocusKind.Object_Name:
        return DexReducer.DexObject.setName(DexObjectId(props.targetId), value);
      case FocusKind.Property_Name:
        return DexReducer.DexBasicProperty.setName(DexBasicPropertyId(props.targetId), value);
      default:
        throw new Error("Invalid focus kind");
    }
  },
};

function getLabel(kind: TextFieldFocusKind): string {
  switch (kind) {
    case FocusKind.Object_Name:
    case FocusKind.Property_Name:
      return "Name";
    default:
      throw new Error("Invalid focus kind");
  }
}

export const TextFieldGetter = {
  state(appState: AppState, props: TextFieldFocusTarget): TextFieldState {
    const { kind: focusKind, targetId } = props;
    const value = this.textFieldValue(appState, focusKind, targetId);
    const isEditing = DexGetter.isEditing(appState, focusKind, targetId);
    const label = getLabel(focusKind);
    const state: TextFieldState = { label, value, isEditing };
    return state;
  },

  textFieldValue(appState: AppState, kind: TextFieldFocusKind, targetId: string): string {
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
