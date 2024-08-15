import type { ExObject } from "src/ex-object/ExObject";
import type MainContext from "src/main-context/MainContext";
import { ofType } from "unionize";

export const ExObjectFocusKind = {
    ExObject: ofType<{exObject: ExObject}>(),
    
};

export namespace ExObjectFocusFuncs {
    export async function register(ctx: MainContext) {

    }
}
