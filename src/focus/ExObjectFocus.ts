import assert from "assert-ts";
import { firstValueFrom } from "rxjs";
import { type Property } from "src/ex-object/Property";
import { log5 } from "src/utils/utils/Log5";
import { type OBS } from "src/utils/utils/Utils";
import { dexVariant, type DexVariantKind } from "src/utils/utils/VariantUtils4";
import { pass, type VariantOf } from "variant";
import type { Expr } from "src/ex-object/Expr";
import { Hotkeys } from "src/ctx/FocusCtx";
import type { ExItem } from "src/ex-object/ExItem";
import type { ExObject } from "src/ex-object/ExObject";

const log55 = log5("ExObjectFocus.ts");

interface ExObjectFocus_ {
  ExObject: { exObject: ExObject };
  Name: { exObject: ExObject; isEditing: boolean };
  Component: { exObject: ExObject };
  PropertyName: { property: Property; isEditing: boolean };

  ExObjectRefactorCommand: { exObject: ExObject },
  ExprRefactorCommand: { expr: Expr },
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

export function createExObjectFocusContext(ctx: MainContext) {
  const { focusCtx } = ctx;

  function mapExObjectFocus$(
    focusKindCheck: (obj: any) => boolean
  ): OBS<ExObject | false> {
    return ctx.focusCtx.mapFocus$((focus) => {
      if (!focusKindCheck(focus)) {
        return false;
      }
      return (focus as any).exObject;
    });
  }

  async function* getProperties(exObject: ExObject): AsyncGenerator<Property> {
    const basicProperties = await firstValueFrom(exObject.basicProperties);
    yield exObject.cloneCountProperty;
    for (const property of exObject.componentParameterProperties) {
      yield property;
    }
    for (const property of basicProperties) {
      yield property;
    }
  }

  async function getNextProperty(property: Property): Promise<Property | null> {
    const exObject = await firstValueFrom(property.parent$);
    assert(exObject !== null && exObject.itemType === ExItemType.ExObject);
    let found = false;
    for await (const p of getProperties(exObject)) {
      if (found) {
        return p;
      }
      if (p === property) {
        found = true;
      }
    }
    return null;
  }

  return {
    get exObjectFocus$() {
      return mapExObjectFocus$(FocusKind.is.ExObject);
    },

    get nameFocus$() {
      return mapExObjectFocus$(FocusKind.is.ExObjectName);
    },

    get componentFocus$() {
      return mapExObjectFocus$(FocusKind.is.ExObjectComponent);
    },

    get propertyFocus$() {
      return ctx.focusCtx.mapFocus$((focus) => {
        return FocusKind.is.Property(focus) ? focus.property : false;
      });
    },

    getNextProperty,

    async prevProperty(property: Property): Promise<Property | null> {
      const exObject = await firstValueFrom(property.parent$);
      assert(exObject !== null && exObject.itemType === ExItemType.ExObject);
      let prev = null;
      for await (const p of getProperties(exObject)) {
        if (p === property) {
          return prev;
        }
        prev = p;
      }
      return null;
    },

    async focusNextExItem(property: Property) {
      const nextProperty = await getNextProperty(property);
      if (nextProperty !== null) {
        focusCtx.setFocus(FocusKind.Property({ property: nextProperty }));
        return;
      }

      const exObject = await firstValueFrom(property.parent$);
      assert(exObject !== null && exObject.itemType === ExItemType.ExObject);

      // Find the first child exObject
      const children = await firstValueFrom(exObject.children$);
      const child = children[0];
      if (child !== undefined) {
        focusCtx.setFocus(FocusKind.ExObject({ exObject: child }));
        return;
      }

      // Find the next root object
      const project = await firstValueFrom(ctx.projectManager.currentProject$);
      const rootExObject = await ExObjectFns.getRootExObject(exObject);
      const rootExObjects = await firstValueFrom(project.rootExObjects$);
      const index = rootExObjects.indexOf(rootExObject);
      assert(index !== -1);
      const nextIndex = index + 1;
      const nextRootExObject = rootExObjects[nextIndex];
      if (nextRootExObject !== undefined) {
        focusCtx.setFocus(FocusKind.ExObject({ exObject: nextRootExObject }));
        return;
      }
    },

    async focusPrevExItem(property: Property) {
      const prevProperty = await this.prevProperty(property);
      if (prevProperty !== null) {
        focusCtx.setFocus(FocusKind.Property({ property: prevProperty }));
        return;
      }

      const exObject = await firstValueFrom(property.parent$);
      assert(exObject !== null && exObject.itemType === ExItemType.ExObject);

      // Find the parent exObject
      const parent = await firstValueFrom(exObject.parent$);
      if (parent !== null) {
        assert(parent.itemType === ExItemType.ExObject);
        focusCtx.setFocus(FocusKind.ExObject({ exObject: parent }));
        return;
      }

      // Find the previous root object
      const project = await firstValueFrom(ctx.projectManager.currentProject$);
      const rootExObject = await ExObjectFns.getRootExObject(exObject);
      const rootExObjects = await firstValueFrom(project.rootExObjects$);
      const index = rootExObjects.indexOf(rootExObject);
      assert(index !== -1);
      const prevIndex = index - 1;
      const prevRootExObject = rootExObjects[prevIndex];
      if (prevRootExObject !== undefined) {
        focusCtx.setFocus(FocusKind.ExObject({ exObject: prevRootExObject }));
        return;
      }
    },

    async getNextExItem(property: Property): Promise<ExItem | null> {
      const nextProperty = await getNextProperty(property);
      return nextProperty;
    },

    get exItemFocus$() {
      return ctx.focusCtx.mapFocus$((focus) => {
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
    },
  };
}

export namespace ExObjectFocusFuncs {
  export async function register(ctx: MainContext) {
    const { focusCtx, keyboardCtx } = ctx;
    const { exObjectFocusCtx } = ctx;

    // New Actions

    keyboardCtx
      .onKeydown$("n", exObjectFocusCtx.exItemFocus$)
      .subscribe(async (exItem) => {
        focusCtx.setFocus(FocusKind.ExItemNewActions({ exItem }));
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

    keyboardCtx.onKeydown$("f", refactorExprFocus$).subscribe(async (focus) => {
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
        assert(exObject !== null && exObject.itemType === ExItemType.ExObject);

        const prevProperty = await exObjectFocusCtx.prevProperty(property);
        if (prevProperty === null) {
          focusCtx.setFocus(FocusKind.ExObjectComponent({ exObject }));
        } else {
          focusCtx.setFocus(FocusKind.Property({ property: prevProperty }));
        }
      });
  }
}
