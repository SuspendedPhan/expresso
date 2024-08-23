import { filter, map } from "rxjs";
import type MainContext from "src/main-context/MainContext";
import type { Focus } from "src/utils/focus/Focus";
import type { OBS, SUB } from "src/utils/utils/Utils";

export type EditableFocus = Focus & { isEditing: boolean };

export interface FieldInit<T extends EditableFocus> {
    ctx: MainContext;
    label: string;

    value$: SUB<string>;
    focusIsFn: (focus: Focus) => focus is T;
    createEditingFocusFn: () => Focus;
    filterFn(focus: T): boolean;
}

export interface FieldData {
    handleInput: (e: Event) => void;
    label: string;
    value$: SUB<string>;
    isEditing$: OBS<boolean>;
    isFocused$: OBS<boolean>;
}

export function createFieldData<T extends EditableFocus>(init: FieldInit<T>): FieldData {
    const { ctx } = init;
    const {focusCtx, keyboardCtx} = ctx;

    const focus$ = focusCtx.focusOrFalse$(init.focusIsFn).pipe(
        filter(f => f !== false),
        filter(init.filterFn),
    );

    const isFocused$ = focusCtx.focusOrFalse$(init.focusIsFn).pipe(
        map(f => f !== false && init.filterFn(f)),
    );

    const isEditing$ = focus$.pipe(
        map(f => f.isEditing),
    );

    const editingFocus$ = focus$.pipe(
        map(f => f.isEditing ? f : false),
    );

    const notEditingFocus$ = focus$.pipe(
        map(f => f.isEditing ? false : f),
    );

    keyboardCtx.onKeydown2$({
        keys: "e",
        data$: notEditingFocus$,
        preventDefault: true,
    }).subscribe(() => {
        console.log("edit");
        
        focusCtx.setFocus(init.createEditingFocusFn());
    });

    keyboardCtx.registerCancel(editingFocus$);

    return {
        handleInput: (e: Event) => {
            const target = e.target as HTMLInputElement;
            if (target.value === "") {
                init.value$.next("a");
            } else {
                init.value$.next(target.value);
            }
        },
        label: init.label,
        value$: init.value$,
        isEditing$,
        isFocused$,
    };
}
