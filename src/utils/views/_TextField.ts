import { Effect, type Stream } from "effect";
import { Subject } from "rxjs";
import { DexRuntime } from "src/utils/utils/DexRuntime";
import { EffectUtils } from "src/utils/utils/EffectUtils";
import { log5 } from "src/utils/utils/Log5";
import { type OBS } from "src/utils/utils/Utils";
import {
  createFieldValueData,
  type EditableFocus,
  type FieldData,
  type FieldInit,
  type FieldValueData,
  type FieldValueInit,
} from "src/utils/views/Field";

const log55 = log5("TextField.ts");

export interface TextFieldData extends TextFieldValueData {
  label: string;
}

export interface TextFieldValueData extends FieldValueData {
  onInput: Stream.Stream<string>;
  handleInput: (e: Event) => void;
  value$: OBS<string>;
}

export function createTextFieldValueData<T extends EditableFocus>(
  init: FieldValueInit<T>
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
  init: FieldInit<T>
) {
  return Effect.gen(function* () {
    const fieldValueData = yield* createTextFieldValueData(init);

    const fieldData: FieldData = {
      ...fieldValueData,
      label: init.label,
    };
    return fieldData;
  });
}
