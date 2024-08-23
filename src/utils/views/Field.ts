import type MainContext from "src/main-context/MainContext";
import type { Focus } from "src/utils/focus/Focus";
import { FocusKind } from "src/utils/focus/FocusKind";
import type { SUB } from "src/utils/utils/Utils";

export function createField<T extends Focus>(ctx: MainContext, data: {
    obj: T;
    label: string;
    value$: SUB<string>;
    focusKindIs: (focus: Focus) => focus is T;
    focusKindCtor: (obj: T) => Focus;
}) {

    return {
        handleInput: (e: Event) => {
        },


    };
}

createField(null as any, {
    focusKindCtor: FocusKind.Expr
});