import { firstValueFrom } from "rxjs";
import { type Component } from "src/ex-object/Component";
import type { ExFunc } from "src/ex-object/ExFunc";
import type { ExObject } from "src/ex-object/ExObject";
import { type Expr } from "src/ex-object/Expr";
import type { Property } from "src/ex-object/Property";
import type { SUB } from "src/utils/utils/Utils";

export type ExItem = Component | ExObject | Expr | ExFunc | Property;
export type Parent = ExItem | null;

export interface ExItemBase {
  readonly id: string;
  readonly ordinal: number;
  readonly parent$: SUB<Parent>;

  // Completes when destroyed.
  readonly destroy$: SUB<void>;
}

export namespace ExItemFn {
  export async function* getAncestors(item: ExItem): AsyncGenerator<ExItem> {
    let parent: Parent = await firstValueFrom(item.parent$);
    while (parent !== null) {
      yield parent;
      parent = await firstValueFrom(parent.parent$);
    }
  }
}
