import { Effect } from "effect";
import { LibraryCtx } from "src/ctx/LibraryCtx";
import { LibraryProjectCtx } from "src/ctx/LibraryProjectCtx";
import { Library } from "src/ex-object/Library";

export const EditorAction = {
    newProject() {
        return Effect.gen(function* () {
            const library = yield* LibraryCtx.library;
            const libraryProject = yield* Library.Methods(library).addProjectBlank();
            (yield* LibraryProjectCtx.activeLibraryProject$).next(libraryProject);
        });
    }
}