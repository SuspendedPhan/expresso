import type { ExItem } from "src/ex-object/ExItem";
import type { ExObject } from "src/ex-object/ExObject";
import type { Property } from "src/ex-object/Property";
import { ofType } from "unionize";


export const ExObjectFocusKind = {
  ExObject: ofType<{ exObject: ExObject; }>(),
  ExObjectName: ofType<{ exObject: ExObject; }>(),
  ExObjectComponent: ofType<{ exObject: ExObject; }>(),
  Property: ofType<{ property: Property; }>(),

  ExItemNewActions: ofType<{ exItem: ExItem; }>(),
  ExObjectRefactor: ofType<{ exObject: ExObject; }>(),
};
