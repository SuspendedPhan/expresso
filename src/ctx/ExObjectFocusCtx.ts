import assert from "assert-ts";
import { Context, Layer, Effect } from "effect";
import { firstValueFrom } from "rxjs";
import type { ExItem } from "src/ex-object/ExItem";
import type { ExObject } from "src/ex-object/ExObject";
import type { Property } from "src/ex-object/Property";
import { FocusKind } from "src/utils/focus/FocusKind";
import type { OBS } from "src/utils/utils/Utils";

export class ExObjectFocusCtx extends Context.Tag("ExObjectFocusCtx")<
  ExObjectFocusCtx,
  {
    get exObjectFocus$(): OBS<ExObject | false>;
    // get nameFocus$(): OBS<ExObject>;
    // get componentFocus$(): OBS<ExObject>;
    // get propertyFocus$(): OBS<Property | false>;
    // getNextProperty(property: Property): Promise<Property | null>;
    // prevProperty(property: Property): Promise<Property | null>;
    // focusNextExItem(property: Property): Promise<void>;
    // focusPrevExItem(property: Property): Promise<void>;
    // getNextExItem(property: Property): Promise<ExItem | null>;
    // get exItemFocus$(): OBS<ExItem | false>;
  }
>() {}

export const ExObjectFocusCtxLive = Layer.effect(
  ExObjectFocusCtx,
  Effect.gen(function* () {
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

    async function* getProperties(
      exObject: ExObject
    ): AsyncGenerator<Property> {
      const basicProperties = await firstValueFrom(exObject.basicProperties$);
      yield exObject.cloneCountProperty;
      for (const property of exObject.componentParameterProperties) {
        yield property;
      }
      for (const property of basicProperties) {
        yield property;
      }
    }

    async function getNextProperty(
      property: Property
    ): Promise<Property | null> {
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
        const project = await firstValueFrom(
          ctx.projectManager.currentProject$
        );
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
        const project = await firstValueFrom(
          ctx.projectManager.currentProject$
        );
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
  })
);