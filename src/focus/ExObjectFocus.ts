import assert from "assert-ts";
import { Effect } from "effect";
import { firstValueFrom } from "rxjs";
import { ExObjectFocusCtx } from "src/ctx/ExObjectFocusCtx";
import { FocusCtx, Hotkeys } from "src/ctx/FocusCtx";
import { KeyboardCtx } from "src/ctx/KeyboardCtx";
import type { ExObject } from "src/ex-object/ExObject";
import type { Expr } from "src/ex-object/Expr";
import { type Property } from "src/ex-object/Property";
import { ExItemFocus, ExItemFocusFactory } from "src/focus/ExItemFocus";
import { log5 } from "src/utils/utils/Log5";
import { dexVariant, type DexVariantKind } from "src/utils/utils/VariantUtils4";
import { isOfVariant, matcher, pass, variant, type VariantOf } from "variant";

const log55 = log5("ExObjectFocus.ts");

interface ExObjectFocus_ {
  ExObject: { exObject: ExObject };
  Name: { exObject: ExObject; isEditing: boolean };
  Component: { exObject: ExObject };
  PropertyName: { property: Property; isEditing: boolean };

  ExObjectRefactorCommand: { exObject: ExObject };
  ExprRefactorCommand: { expr: Expr };
}

export const ExObjectFocusFactory = dexVariant.scoped("ExObjectFocus")(
  dexVariant.typed<ExObjectFocus_>({
    ExObject: pass,
    Name: pass,
    Component: pass,
    PropertyName: pass,

    ExObjectRefactorCommand: pass,
    ExprRefactorCommand: pass,
  })
);

export type ExObjectFocus = VariantOf<typeof ExObjectFocusFactory>;
export type ExObjectFocusKind = DexVariantKind<typeof ExObjectFocusFactory>;

export const ExItemBasicFocusFactory = variant([
  ExObjectFocusFactory.ExObject,
  ExObjectFocusFactory.Name,
  ExObjectFocusFactory.Component,
  ExObjectFocusFactory.PropertyName,
]);

export const ExObjectFocus = {
  get exObjectBasicFocus$() {
    return Effect.gen(function* () {
      return (yield* FocusCtx).mapFocus$((focus) => {
        if (!isOfVariant(focus, ExItemBasicFocusFactory)) {
          return false;
        }

        const exItem = matcher(focus)
          .when(
            [
              ExObjectFocusFactory.ExObject,
              ExObjectFocusFactory.Name,
              ExObjectFocusFactory.Component,
            ],
            ({ exObject }) => exObject
          )
          .when(ExObjectFocusFactory.PropertyName, ({ property }) => property)
          .complete();

        return exItem;
      });
    });
  },

  register() {
    return Effect.gen(this, function* () {
      const keyboardCtx = yield* KeyboardCtx;
      const focusCtx = yield* FocusCtx;
      const exObjectFocusCtx = yield* ExObjectFocusCtx;

      // New Actions

      keyboardCtx
        .onKeydown$("n", yield* this.exObjectBasicFocus$)
        .subscribe(async (exItem) => {
          FocusCtx.setFocus(ExItemFocusFactory.NewCommand({ exItem }));
        });

      const newActionsFocus$ = focusCtx.mapFocus$((focus) =>
        FocusKind.is.ExItemNewActions(focus) ? focus : false
      );

      keyboardCtx.onKeydown$("p", newActionsFocus$).subscribe(async (focus) => {
        const exObject = await ExObjectFns.getExObject(focus.exItem);
        assert(exObject !== null);
        ExObjectFns.addBasicPropertyBlank(ctx, exObject);
        focusCtx.popFocus();
      });

      keyboardCtx.onKeydown$("c", newActionsFocus$).subscribe(async (focus) => {
        const exObject = await ExObjectFns.getExObject(focus.exItem);
        assert(exObject !== null);
        ExObjectFns.addChildBlank(ctx, exObject);
        focusCtx.popFocus();
      });

      ctx.viewCtx.commandCardCtx.addCommandCard({
        title: "ExObject Commands",
        commands: ["New Property", "New Child"],
        visible$: focusCtx.mapFocus$(FocusKind.is.ExItemNewActions),
      });

      keyboardCtx.registerCancel(newActionsFocus$);

      // Refactor - Extract Component

      keyboardCtx
        .onKeydown$("r", exObjectFocusCtx.exObjectFocus$)
        .subscribe(async (exObject) => {
          focusCtx.setFocus(FocusKind.ExObjectRefactor({ exObject }));
        });

      const refactorFocus$ = focusCtx.mapFocus$((focus) =>
        FocusKind.is.ExObjectRefactor(focus) ? focus : false
      );

      keyboardCtx.onKeydown$("c", refactorFocus$).subscribe(async (focus) => {
        const exObject = focus.exObject;
        ctx.refactorCtx.extractComponent(exObject);
        focusCtx.popFocus();
      });

      ctx.viewCtx.commandCardCtx.addCommandCard({
        title: "ExObject Refactor",
        commands: ["Extract Component", "Extract Function"],
        visible$: focusCtx.mapFocus$(FocusKind.is.ExObjectRefactor),
      });

      keyboardCtx.registerCancel(refactorFocus$);

      // Refactor - Extract Function

      keyboardCtx
        .onKeydown$("r", focusCtx.exprFocusCtx.getExprFocus$(false))
        .subscribe(async (focus) => {
          focusCtx.setFocus(FocusKind.ExprRefactor({ expr: focus.expr }));
        });

      const refactorExprFocus$ = focusCtx.focusOrFalse$(
        FocusKind.is.ExprRefactor
      );

      keyboardCtx
        .onKeydown$("f", refactorExprFocus$)
        .subscribe(async (focus) => {
          const expr = focus.expr;
          ctx.refactorCtx.extractExFunc(expr);
          focusCtx.popFocus();
        });

      ctx.viewCtx.commandCardCtx.addCommandCard({
        title: "Expr Refactor",
        commands: ["Extract Function"],
        visible$: focusCtx.mapFocus$(FocusKind.is.ExprRefactor),
      });

      keyboardCtx.registerCancel(refactorExprFocus$);

      // Down Root

      keyboardCtx
        .onKeydown$(Hotkeys.Down, focusCtx.mapFocus$(FocusKind.is.None))
        .subscribe(async () => {
          const project = await firstValueFrom(
            ctx.projectManager.currentProject$
          );
          const objs = await firstValueFrom(project.rootExObjects$);
          const obj = objs[0];
          if (obj === undefined) {
            return;
          }

          focusCtx.setFocus(FocusKind.ExObject({ exObject: obj }));
        });

      // Down

      keyboardCtx
        .onKeydown$(Hotkeys.Down, exObjectFocusCtx.exObjectFocus$)
        .subscribe((exObject) => {
          focusCtx.setFocus(
            FocusKind.ExObjectName({ exObject, isEditing: false })
          );
        });

      keyboardCtx
        .onKeydown$(
          Hotkeys.Down,
          focusCtx.editingFocus$(FocusKind.is.ExObjectName, false)
        )
        .subscribe((f) => {
          focusCtx.setFocus(
            FocusKind.ExObjectComponent({ exObject: f.exObject })
          );
        });

      keyboardCtx
        .onKeydown$(Hotkeys.Down, exObjectFocusCtx.componentFocus$)
        .subscribe((exObject) => {
          const property = exObject.cloneCountProperty;
          focusCtx.setFocus(FocusKind.Property({ property }));
        });

      // Up

      keyboardCtx
        .onKeydown$(
          Hotkeys.Up,
          focusCtx.editingFocus$(FocusKind.is.ExObjectName, false)
        )
        .subscribe((f) => {
          log55.debug("up");

          focusCtx.setFocus(FocusKind.ExObject({ exObject: f.exObject }));
        });

      keyboardCtx
        .onKeydown$(Hotkeys.Up, exObjectFocusCtx.componentFocus$)
        .subscribe((exObject) => {
          focusCtx.setFocus(
            FocusKind.ExObjectName({ exObject, isEditing: false })
          );
        });

      keyboardCtx
        .onKeydown$(Hotkeys.Up, exObjectFocusCtx.propertyFocus$)
        .subscribe(async (property) => {
          const exObject = await firstValueFrom(property.parent$);
          assert(
            exObject !== null && exObject.itemType === ExItemType.ExObject
          );

          const prevProperty = await exObjectFocusCtx.prevProperty(property);
          if (prevProperty === null) {
            focusCtx.setFocus(FocusKind.ExObjectComponent({ exObject }));
          } else {
            focusCtx.setFocus(FocusKind.Property({ property: prevProperty }));
          }
        });
    });
  },
};
