import { Effect } from "effect";
import { combineLatestWith, map } from "rxjs";
import { KeyboardCtx } from "src/ctx/KeyboardCtx";
import { LibraryCtx } from "src/ctx/LibraryCtx";

import { DexWindow, ViewCtx } from "src/ctx/ViewCtx";
import { ExItem } from "src/ex-object/ExItem";
import { ExObjectFactory2 } from "src/ex-object/ExObject";
import { LibraryProjectFactory2 } from "src/ex-object/LibraryProject";
import { Project } from "src/ex-object/Project";
import { FocusFactory } from "src/focus/Focus";
import { FocusCtx } from "src/focus/FocusCtx";
import { CommandCardCtx } from "src/utils/utils/CommandCard";
import { DexRuntime } from "src/utils/utils/DexRuntime";
import { dexVariant, type DexVariantKind } from "src/utils/utils/VariantUtils4";
import { isType, pass, type VariantOf } from "variant";

interface EditorFocus_ {
  NewActions: { exItem: ExItem | null };
}

export const EditorFocusFactory = dexVariant.scoped("EditorFocus")(
  dexVariant.typed<EditorFocus_>({
    NewActions: pass,
  })
);

export type EditorFocus = VariantOf<typeof EditorFocusFactory>;
export type EditorFocusKind = DexVariantKind<typeof EditorFocusFactory>;

export const EditorFocus = {
  register: Effect.gen(function* () {
    const focusCtx = yield* FocusCtx;
    const keyboardCtx = yield* KeyboardCtx;
    const viewCtx = yield* ViewCtx;
    const commandCardCtx = yield* CommandCardCtx;

    keyboardCtx
      .onKeydown$(
        "n",
        viewCtx.activeWindowEqualTo$(DexWindow.ProjectEditor).pipe(
          combineLatestWith(focusCtx.mapFocus$(isType(FocusFactory.None))),
          map(([activeWindow, noneFocus]) => {
            return activeWindow && noneFocus;
          })
        )
      )
      .subscribe(async () => {
        // const effect = Effect.gen(function* () {
        //     const exItem$ = yield* ExItemFocus.exItemBasicFocus$;
        //     const exItem = yield* EffectUtils.firstValueFrom(exItem$);
        //     focusCtx.setFocus(
        //       EditorFocusFactory.NewActions({
        //         exItem: exItem === false ? null : exItem,
        //       })
        //     );
        //   });
        // DexRuntime.runPromise(
        //   effect
        // );
      });

    const focusIsEditorNewActions$ = focusCtx.mapFocus$((focus) => {
      return isType(focus, EditorFocusFactory.NewActions) ? focus : false;
    });

    commandCardCtx.addCommandCard({
      title: "Editor Commands",
      commands: ["New Object", "New Project"],
      visible$: focusIsEditorNewActions$.pipe(map((focus) => focus !== false)),
    });

    keyboardCtx.onKeydown$("p", focusIsEditorNewActions$).subscribe(() => {
      DexRuntime.runPromise(
        Effect.gen(function* () {
          const library = yield* LibraryCtx.library;
          const libraryProject = yield* LibraryProjectFactory2({});
          yield* library.libraryProjects.push(libraryProject);
          focusCtx.popFocus();
        })
      );
    });

    keyboardCtx.onKeydown$("o", focusIsEditorNewActions$).subscribe(() => {
      DexRuntime.runPromise(
        Effect.gen(function* () {
          const project = yield* Project.activeProject;
          const exObject = yield* ExObjectFactory2({});
          yield* project.rootExObjects.push(exObject);
          focusCtx.popFocus();
        })
      );
    });

    keyboardCtx.registerCancel(focusIsEditorNewActions$);
  }),
};
