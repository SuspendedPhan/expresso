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

    const focus$ = focusCtx.mapFocus2$(init.focusIsFn).pipe(
        filter(f => f !== false),
        filter(init.filterFn),
    );

    const isFocused$ = focusCtx.mapFocus2$(init.focusIsFn).pipe(
        map(f => f !== false && init.filterFn(f)),
    );

    const isEditing$ = focusCtx.mapFocus2$(init.focusIsFn).pipe(
        map(f => f !== false && f.isEditing),
    );

    const editingFocus$ = focus$.pipe(
        filter(f => f.isEditing),
    );

    keyboardCtx.onKeydown$("e", editingFocus$).subscribe(() => {
        console.log("editing");
        
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
