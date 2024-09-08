import { map, Subject } from "rxjs";
import {
  createBehaviorSubjectWithLifetime,
  type OBS,
} from "src/utils/utils/Utils";

export type ArrayEvent<T> =
  | ItemAdded<T>
  | ItemRemoved<T>
  | CurrentItem<T>
  | ItemReplaced<T>;

export interface ItemAdded<T> {
  readonly type: "ItemAdded";
  readonly newItem: T;
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

export interface CurrentItem<T> {
  readonly type: "CurrentItem";
  readonly item: T;
}

export type ObservableArray<T> = ReturnType<
  typeof createObservableArrayWithLifetime<T>
>;

export function createObservableArrayWithLifetime<T>(
  destroy$: OBS<void>,
  initialItems: T[] = []
) {
  const items$ = createBehaviorSubjectWithLifetime(destroy$, initialItems);
  return {
    kind: "ObservableArray" as const,

    event$: new Subject<ArrayEvent<T>>(),

    get items() {
      return items$.value;
    },

    items$,

    push(item: T) {
      this.items.push(item);
      this.event$.next({ type: "ItemAdded", newItem: item });
    },

    replaceItem(oldItem: T, newItem: T) {
      const index = this.items.indexOf(oldItem);
      if (index === -1) {
        throw new Error("Item not found");
      }
      this.items[index] = newItem;
      this.event$.next({ type: "ItemReplaced", newItem, oldItem });
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
