import type { ExObject } from "src/ex-object/ExObject";
import type { Property } from "src/ex-object/Property";
import type MainContext from "src/main-context/MainContext";
import { ofType } from "unionize";

export const ExObjectFocusKind = {
    ExObject: ofType<{exObject: ExObject}>(),
    Name: ofType<{exObject: ExObject}>(),
    Component: ofType<{exObject: ExObject}>(),
    Property: ofType<{property: Property}>(),
};

export namespace ExObjectFocusFuncs {
    export async function register(_ctx: MainContext) {

    }
}
