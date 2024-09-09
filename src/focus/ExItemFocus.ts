import assert from "assert-ts";
import { Effect } from "effect";
import { FocusCtx } from "src/ctx/FocusCtx";
import { ProjectCtx } from "src/ctx/ProjectCtx";
import type { ExItem } from "src/ex-object/ExItem";
import { ExObject, ExObjectFactory } from "src/ex-object/ExObject";
import { Property } from "src/ex-object/Property";
import { ExObjectFocusFactory } from "src/focus/ExObjectFocus";
import { EffectUtils } from "src/utils/utils/EffectUtils";
import { dexVariant, type DexVariantKind } from "src/utils/utils/VariantUtils4";
import { isType, matcher, pass, type VariantOf } from "variant";

interface ExItemFocus_ {
  NewCommand: { exItem: ExItem };
}

export const ExItemFocusFactory = dexVariant.scoped("ExItemFocus")(
  dexVariant.typed<ExItemFocus_>({
    NewCommand: pass,
  })
);

export type ExItemFocus = VariantOf<typeof ExItemFocusFactory>;
export type ExItemFocusKind = DexVariantKind<typeof ExItemFocusFactory>;

export const ExItemFocus = {
  focusNextExItem(property: Property) {
    return Effect.gen(function* () {
      const focusCtx = yield* FocusCtx;

      const nextProperty = yield* Effect.promise(() =>
        Property.Methods(property).getNextProperty()
      );
      if (nextProperty !== null) {
        const focus = ExObjectFocusFactory.PropertyName({
          property: nextProperty,
          isEditing: false,
        });
        focusCtx.setFocus(focus);
        return;
      }

      const exObject = yield* EffectUtils.firstValueFrom(property.parent$);
      assert(exObject !== null && isType(exObject, ExObjectFactory));

      // Find the first child exObject
      const children = yield* EffectUtils.firstValueFrom(exObject.children$);
      const child = children[0];
      if (child !== undefined) {
        focusCtx.setFocus(ExObjectFocusFactory.ExObject({ exObject: child }));
        return;
      }

      // Find the next root object
      const project = yield* (yield* ProjectCtx).activeProject;
      const rootExObject = yield* ExObject.Methods(exObject).getRootExObject();
      const rootExObjects = project.rootExObjects.items;
      const index = rootExObjects.indexOf(rootExObject);
      assert(index !== -1);
      const nextIndex = index + 1;
      const nextRootExObject = rootExObjects[nextIndex];
      if (nextRootExObject !== undefined) {
        focusCtx.setFocus(
          ExObjectFocusFactory.ExObject({ exObject: nextRootExObject })
        );
        return;
      }
    });
  },

  focusPrevExItem(property: Property) {
    return Effect.gen(function* () {
      const focusCtx = yield* FocusCtx;
      const prevProperty = yield* Effect.promise(() =>
        Property.Methods(property).prevProperty()
      );
      if (prevProperty !== null) {
        const focus = ExObjectFocusFactory.PropertyName({
          property: prevProperty,
          isEditing: false,
        });
        focusCtx.setFocus(focus);
        return;
      }

      const exObject = yield* EffectUtils.firstValueFrom(property.parent$);
      assert(exObject !== null && isType(exObject, ExObjectFactory));

      // Find the parent exObject
      const parent = yield* EffectUtils.firstValueFrom(exObject.parent$);
      if (parent !== null) {
        assert(isType(parent, ExObjectFactory));
        focusCtx.setFocus(ExObjectFocusFactory.ExObject({ exObject: parent }));
        return;
      }

      // Find the previous root object
      const project = yield* (yield* ProjectCtx).activeProject;
      const rootExObject = yield* ExObject.Methods(exObject).getRootExObject();
      const rootExObjects = project.rootExObjects.items;
      const index = rootExObjects.indexOf(rootExObject);
      assert(index !== -1);
      const prevIndex = index - 1;
      const prevRootExObject = rootExObjects[prevIndex];
      if (prevRootExObject !== undefined) {
        focusCtx.setFocus(
          ExObjectFocusFactory.ExObject({ exObject: prevRootExObject })
        );
        return;
      }
    });
  },

  exItemFocus$: Effect.gen(function* () {
    return (yield* FocusCtx).mapFocus$((focus) => {
      matcher(focus)
        .when(ExObjectFocusFactory.ExObject, ({ exObject }) => exObject)
        .when(ExObjectFocusFactory.Name, ({ exObject }) => exObject)

      const exItem: ExItem | false = FocusKind.match(focus, {
        ExObject: ({ exObject }) => exObject as ExItem | false,
        ExObjectName: ({ exObject }) => exObject,
        ExObjectComponent: ({ exObject }) => exObject,
        Property: ({ property }) => property,
        Expr: ({ expr }) => expr,
        default: () => false,
      });
      return exItem;
    });
  }),
};
