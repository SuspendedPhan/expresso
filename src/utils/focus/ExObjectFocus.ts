import type { ExObject } from "src/ex-object/ExObject";
import type { Property } from "src/ex-object/Property";
import type MainContext from "src/main-context/MainContext";
import { FocusFns } from "src/utils/utils/Focus";
import { Focus2Kind } from "src/utils/utils/FocusManager";
import { FocusScope } from "src/utils/utils/FocusSCope";
import { ofType } from "unionize";

export const ExObjectFocusKind = {
    ExObject: ofType<{exObject: ExObject}>(),
    Name: ofType<{exObject: ExObject}>(),
    Component: ofType<{exObject: ExObject}>(),
    Property: ofType<{property: Property}>(),
};

export namespace ExObjectFocusFuncs {
    export async function register(ctx: MainContext) {
        const exObjectScope = new FocusScope(FocusFns.isFocus2Focused$(ctx, Focus2Kind.is.ExObject));
    }
}
