import type { Draft } from "mutative";
import type { AppState } from "./AppState";
import { FocusKind, type TextFieldFocusKind } from "./DexFocus";
import { DexGetter } from "./DexGetter";
import { DexReducer } from "./DexReducer";
import { DexBasicPropertyId, DexObjectId } from "./DexDomain";

export interface TextFieldProps {
  targetId: string;
  focusKind: TextFieldFocusKind;
}

export interface TextFieldState {
  label?: string;
  value: string;
  isEditing: boolean;
}

export const TextFieldReducer = {
  updateValue(props: TextFieldProps, value: string) {
    switch (props.focusKind) {
      case FocusKind.Object_Name:
        return DexReducer.DexObject.setName(DexObjectId(props.targetId), value);
      case FocusKind.Property_Name:
        return DexReducer.DexBasicProperty.setName(DexBasicPropertyId(props.targetId), value);
        break;
      default:
        throw new Error("Invalid focus kind");
    }
  },
}

export const TextFieldGetter = {
  props(appState: AppState, focusKind: TextFieldFocusKind, targetId: string): TextFieldProps {
    const value = this.textFieldValue(appState, focusKind, targetId);
    const isEditing = DexGetter.isEditing(appState, focusKind, targetId);
    const focusViewProps = {
      
    }
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
}
