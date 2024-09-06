import { Effect } from "effect";
import { firstValueFrom, Subject } from "rxjs";
import { type Component } from "src/ex-object/Component";
import type { ExFunc } from "src/ex-object/ExFunc";
import type { ExObject } from "src/ex-object/ExObject";
import { type Expr } from "src/ex-object/Expr";
import type { Property } from "src/ex-object/Property";
import {
  createBehaviorSubjectWithLifetime,
  type SUB,
} from "src/utils/utils/Utils";

export type ExItem = Component | ExObject | Expr | ExFunc | Property;
export type Parent = ExItem | null;

export interface ExItemBase {
  readonly id: string;
  readonly ordinal: number;
  readonly parent$: SUB<Parent>;

  // Completes when destroyed.
  readonly destroy$: SUB<void>;
}

export const ExItem = {
  async *getAncestors(item: ExItem): AsyncGenerator<ExItem> {
    let parent: Parent = await firstValueFrom(item.parent$);
    while (parent !== null) {
      yield parent;
      parent = await firstValueFrom(parent.parent$);
    }
  },

  createExItemBase(id: string) {
    return Effect.gen(function* () {
      const destroy$ = new Subject<void>();

      const exObjectBase: ExItemBase = {
        id,
        ordinal: 0,
        parent$: createBehaviorSubjectWithLifetime<Parent>(destroy$, null),
        destroy$,
      };
      return exObjectBase;
    });
  },
};
