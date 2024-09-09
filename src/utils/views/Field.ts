import { firstValueFrom, map, of } from "rxjs";

import type { Focus } from "src/utils/focus/Focus";
import { log5 } from "src/utils/utils/Log5";
import { RxFns, type OBS, type SUB } from "src/utils/utils/Utils";

const log55 = log5("Field.ts");

export type EditableFocus = Focus & { isEditing: boolean };

export interface FieldValueInit<T extends EditableFocus> {
    ctx: MainContext;

    value$: SUB<string>;
    focusIsFn: (focus: Focus) => focus is T;
    createEditingFocusFn: (isEditing: boolean) => Focus;
    filterFn(focus: T): boolean;
}

export type FieldData = FieldValueData & {
    label: string;
}

export type FieldInit<T extends EditableFocus> = FieldValueInit<T> & {
    label:string;
};

export interface FieldValueData {
    id: string;
    value$: OBS<string>;
    isEditing$: OBS<boolean>;
    isFocused$: OBS<boolean>;
    handleInput: (e: Event) => void;
    handleClick: () => void;
}

export function createFieldValueData<T extends EditableFocus>(init: FieldValueInit<T>): FieldValueData {
    const { ctx } = init;
    const {focusCtx, keyboardCtx} = ctx;

    const isFocused$ = focusCtx.focusOrFalse$(init.focusIsFn).pipe(
        map(f => f !== false && init.filterFn(f)),
    );

    const editingFocus$ = focusCtx.editingFocus$(init.focusIsFn, true).pipe(
        RxFns.getOrFalse(f => init.filterFn(f)),
    );
    const notEditingFocus$ = focusCtx.editingFocus$(init.focusIsFn, false).pipe(
        RxFns.getOrFalse(f => init.filterFn(f)),
    );
    const isEditing$ = editingFocus$.pipe(
        map(f => f !== false),
    );

    keyboardCtx.onKeydown2$({
        keys: "e",
        data$: notEditingFocus$,
        preventDefault: true,
    }).subscribe(() => {
        log55.debug("edit");
        
        focusCtx.setFocus(init.createEditingFocusFn(true));
    });

    keyboardCtx.registerCancel(editingFocus$);

    return {
        id: crypto.randomUUID(),
        handleInput: (e: Event) => {
            const target = e.target as HTMLInputElement;
            if (target.value === "") {
                init.value$.next("a");
            } else {
                init.value$.next(target.value);
            }
        },
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
        value$: init.value$,
        isEditing$,
        isFocused$,
    };
}

export function createFieldData<T extends EditableFocus>(init: FieldInit<T>): FieldData {
    const fieldData = createFieldValueData(init);

    return {
        ...fieldData,
        label: init.label,
    };
}

export interface ReadonlyFieldInit<T extends Focus> {
    ctx: MainContext;
    label: string;

    value$: OBS<string>;
    focusIsFn: (focus: Focus) => focus is T;
    filterFn(focus: T): boolean;
    createFocusFn: () => Focus;
}

export function createReadonlyFieldData<T extends Focus>(init: ReadonlyFieldInit<T>): FieldData {
    const { ctx } = init;
    const {focusCtx} = ctx;

    const isFocused$ = focusCtx.focusOrFalse$(init.focusIsFn).pipe(
        map(f => f !== false && init.filterFn(f)),
    );

    return {
        id: crypto.randomUUID(),
        handleInput: () => {},
        handleClick: () => {
            ctx.focusCtx.setFocus(init.createFocusFn());
        },
        label: init.label,
        value$: init.value$,
        isEditing$: of(false),
        isFocused$,
    };
}