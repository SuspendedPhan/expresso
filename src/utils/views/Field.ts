import { Effect, Stream } from "effect";
import { firstValueFrom, map, of } from "rxjs";
import type { Focus } from "src/focus/Focus";
import { FocusCtx } from "src/focus/FocusCtx";

import { log5 } from "src/utils/utils/Log5";
import { type OBS } from "src/utils/utils/Utils";
import type { FocusViewPropIn } from "./FocusView";

const log55 = log5("Field.ts");

export type EditableFocus = Focus & { isEditing: boolean };

export interface FieldValueInit {
  createEditingFocusFn: (isEditing: boolean) => Focus;
  focusViewPropIn: FocusViewPropIn;
}

export type FieldData = FieldValueData & {
  label: string;
};

export type FieldInit<T extends EditableFocus> = FieldValueInit<T> & {
  label: string;
};

export interface FieldValueData {
  id: string;
  isEditing$: OBS<boolean>;
  focusViewPropIn: FocusViewPropIn;
}

export function createFieldValueData(
  init: FieldValueInit,
) {
  return Effect.gen(function* () {
    const result: FieldValueData = {
      id: crypto.randomUUID(),
      handleClick: async () => {
        log55.debug("click");

        const isEditing = await firstValueFrom(isEditing$);
        if (isEditing) {
          log55.debug("isEditing");

          return;
        }
        log55.debug("notEditing");

        focusCtx.setFocus(init.createEditingFocusFn(false));
      },
      isEditing$,
      isFocused$,
    };
    return result;
  });
}

export function createFieldData<T extends EditableFocus>(init: FieldInit<T>) {
  return Effect.gen(function* () {
    const fieldValueData = yield* createFieldValueData(init);

    const fieldData: FieldData = {
      ...fieldValueData,
      label: init.label,
    };
    return fieldData;
  });
}

export interface ReadonlyFieldInit<T extends Focus> {
  label: string;

  value$: OBS<string>;
  focusIsFn: (focus: Focus) => focus is T;
  filterFn(focus: T): boolean;
  createFocusFn: () => Focus;
}

export function createReadonlyFieldData<T extends Focus>(
  init: ReadonlyFieldInit<T>
) {
  return Effect.gen(function* () {
    const focusCtx = yield* FocusCtx;

    const isFocused$ = focusCtx
      .focusOrFalse$(init.focusIsFn)
      .pipe(map((f) => f !== false && init.filterFn(f)));

    return {
      id: crypto.randomUUID(),
      handleInput: () => {},
      handleClick: () => {
        focusCtx.setFocus(init.createFocusFn());
      },
      label: init.label,
      value$: init.value$,
      isEditing$: of(false),
      isFocused$,
      onInput: Stream.empty,
    } as FieldData;
  });
}
