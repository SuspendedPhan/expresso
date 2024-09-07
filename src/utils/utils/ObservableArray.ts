import { map } from "rxjs";
import {
  createBehaviorSubjectWithLifetime,
  type OBS,
} from "src/utils/utils/Utils";

export type ItemChange<T> =
  | ItemAdded<T>
  | ItemRemoved<T>
  | InitialSubscription
  | ItemReplaced<T>;

export interface ItemAdded<T> {
  readonly type: "ItemAdded";
  readonly item: T;
}

export interface ItemRemoved<T> {
  readonly type: "ItemRemoved";
  readonly item: T;
}

export interface ItemReplaced<T> {
  readonly type: "ItemReplaced";
  readonly newItem: T;
  readonly oldItem: T;
}

export interface InitialSubscription {
  readonly type: "InitialSubscription";
}

export interface ArrayEvent<T> {
  readonly items: T[];
  readonly change: ItemChange<T>;
}

export type ObservableArray<T> = ReturnType<
  typeof createObservableArrayWithLifetime<T>
>;

export function createObservableArrayWithLifetime<T>(
  destroy$: OBS<void>,
  initialItems: T[] = []
) {
  const event: ArrayEvent<T> = {
    change: { type: "InitialSubscription" },
    items: initialItems,
  };
  return {
    kind: "ObservableArray" as const,

    event$: createBehaviorSubjectWithLifetime<ArrayEvent<T>>(destroy$, event),

    get items() {
      return this.event$.getValue().items;
    },

    get items$() {
      return this.event$.pipe(map((evt) => evt.items));
    },

    push(item: T) {
      this.items.push(item);
      this.event$.next({
        change: { type: "ItemAdded", item },
        items: this.items,
      });
    },

    replaceItem(oldItem: T, newItem: T) {
      const index = this.items.indexOf(oldItem);
      if (index === -1) {
        throw new Error("Item not found");
      }
      this.items[index] = newItem;
      this.event$.next({
        change: { type: "ItemReplaced", newItem, oldItem },
        items: this.items,
      });
    },
  };
}

export namespace ObservableArrayFns {
  export function map2<T, R>(
    obsArr: ObservableArray<T> | OBS<T[]>,
    mapFn: (t: T) => R
  ): OBS<R[]> {
    let arr$;
    if ("kind" in obsArr) {
      arr$ = obsArr.items$;
    } else {
      arr$ = obsArr;
    }
    const r = arr$.pipe(map((arr) => arr.map(mapFn)));
    return r;
  }
}
