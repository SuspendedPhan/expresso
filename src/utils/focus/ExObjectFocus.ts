import assert from "assert-ts";
import { firstValueFrom } from "rxjs";
import { ExItemType, type ExItem } from "src/ex-object/ExItem";
import { ExObjectFns, type ExObject } from "src/ex-object/ExObject";
import { type Property } from "src/ex-object/Property";
import type MainContext from "src/main-context/MainContext";
import { FocusKind, Hotkeys } from "src/utils/utils/Focus";
import type { OBS } from "src/utils/utils/Utils";
import { ofType } from "unionize";

export const ExObjectFocusKind = {
  ExObject: ofType<{ exObject: ExObject }>(),
  ExObjectName: ofType<{ exObject: ExObject }>(),
  ExObjectComponent: ofType<{ exObject: ExObject }>(),
  Property: ofType<{ property: Property }>(),
};

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
    const basicProperties = await firstValueFrom(exObject.basicProperties$);
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
  };

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
      // debugger;
      assert(index !== -1);
      const nextIndex = index + 1;
      const nextRootExObject = rootExObjects[nextIndex];
      if (nextRootExObject !== undefined) {
        focusCtx.setFocus(FocusKind.ExObject({ exObject: nextRootExObject }));
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
      .onKeydown$(Hotkeys.Down, exObjectFocusCtx.exObjectFocus$, "hi")
      .subscribe((exObject) => {
        focusCtx.setFocus(FocusKind.ExObjectName({ exObject }));
      });

    keyboardCtx
      .onKeydown$(Hotkeys.Down, exObjectFocusCtx.nameFocus$)
      .subscribe((exObject) => {
        focusCtx.setFocus(FocusKind.ExObjectComponent({ exObject }));
      });

    keyboardCtx
      .onKeydown$(Hotkeys.Down, exObjectFocusCtx.componentFocus$)
      .subscribe((exObject) => {
        const property = exObject.cloneCountProperty;
        focusCtx.setFocus(FocusKind.Property({ property }));
      });

    // Up

    keyboardCtx
      .onKeydown$(Hotkeys.Up, exObjectFocusCtx.nameFocus$)
      .subscribe((exObject) => {
        focusCtx.setFocus(FocusKind.ExObject({ exObject }));
      });

    keyboardCtx
      .onKeydown$(Hotkeys.Up, exObjectFocusCtx.componentFocus$)
      .subscribe((exObject) => {
        focusCtx.setFocus(FocusKind.ExObjectName({ exObject }));
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
