import { Effect } from "effect";
import {
    type EditableFocus,
    type FieldValueData,
    type FieldValueInit,
    createFieldValueData,
} from "src/utils/views/Field";

export interface ComboboxFieldValueInit<T extends EditableFocus>
  extends FieldValueInit<T> {
}

export type ComboboxFieldInit<T extends EditableFocus> =
  ComboboxFieldValueInit<T> & {
    label: string;
  };

export interface ComboboxFieldData extends ComboboxFieldValueData {
  label: string;
}

export interface ComboboxFieldValueData extends FieldValueData {
}

export function createComboboxFieldValueData<T extends EditableFocus>(
    init: ComboboxFieldValueInit<T>
  ) {
    return Effect.gen(function* () {
      const fieldValueData = yield* createFieldValueData(init);
  
      const result: ComboboxFieldValueData = {
        ...fieldValueData,
      };
      return result;
    });
  }
  