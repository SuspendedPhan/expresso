import { Effect, type Stream } from "effect";
import { Subject } from "rxjs";
import { DexRuntime } from "src/utils/utils/DexRuntime";
import { EffectUtils } from "src/utils/utils/EffectUtils";
import { type OBS, type SUB } from "src/utils/utils/Utils";
import {
  createFieldValueData,
  type EditableFocus,
  type FieldValueData,
  type FieldValueInit
} from "src/utils/views/Field";


export interface TextFieldValueInit<T extends EditableFocus> extends FieldValueInit<T> {
  value$: SUB<string>;
}

export type TextFieldInit<T extends EditableFocus> = TextFieldValueInit<T> & {
  label: string;
};

export interface TextFieldData extends TextFieldValueData {
  label: string;
}

export interface TextFieldValueData extends FieldValueData {
  onInput: Stream.Stream<string>;
  handleInput: (e: Event) => void;
  value$: OBS<string>;
}

export function createTextFieldValueData<T extends EditableFocus>(
  init: TextFieldValueInit<T>
) {
  return Effect.gen(function* () {
    const fieldValueData = yield* createFieldValueData(init);
    const onInput$ = new Subject<string>();

    const result: TextFieldValueData = {
      ...fieldValueData,
      handleInput: (e: Event) => {
        const target = e.target as HTMLInputElement;
        if (target.value === "") {
          init.value$.next("a");
          DexRuntime.runPromise(
            Effect.gen(function* () {
              onInput$.next("a");
            })
          );
        } else {
          init.value$.next(target.value);
          onInput$.next(target.value);
        }
      },
      value$: init.value$,
      onInput: EffectUtils.obsToStream(onInput$),
    };
    return result;
  });
}

export function createTextFieldData<T extends EditableFocus>(
  init: TextFieldInit<T>
) {
  return Effect.gen(function* () {
    const fieldValueData = yield* createTextFieldValueData(init);

    const fieldData: TextFieldData = {
      ...fieldValueData,
      label: init.label,
    };
    return fieldData;
  });
}
