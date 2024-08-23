import { firstValueFrom, map } from "rxjs";
import type MainContext from "src/main-context/MainContext";
import type { Focus } from "src/utils/focus/Focus";
import { log5 } from "src/utils/utils/Log3";
import { RxFns, type OBS, type SUB } from "src/utils/utils/Utils";

const log55 = log5("Field.ts");

export type EditableFocus = Focus & { isEditing: boolean };

export interface FieldInit<T extends EditableFocus> {
    ctx: MainContext;
    label: string;

    value$: SUB<string>;
    focusIsFn: (focus: Focus) => focus is T;
    createEditingFocusFn: (isEditing: boolean) => Focus;
    filterFn(focus: T): boolean;
}

export interface FieldData {
    handleInput: (e: Event) => void;
    handleClick: () => void;
    label: string;
    value$: SUB<string>;
    isEditing$: OBS<boolean>;
    isFocused$: OBS<boolean>;
}

export function createFieldData<T extends EditableFocus>(init: FieldInit<T>): FieldData {
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
        label: init.label,
        value$: init.value$,
        isEditing$,
        isFocused$,
    };
}
