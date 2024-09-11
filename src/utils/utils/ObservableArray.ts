import { concat, map, Subject } from "rxjs";
import {
  createBehaviorSubjectWithLifetime,
  type OBS,
} from "src/utils/utils/Utils";

export type ArrayEvent<T> =
  | ItemAdded<T>
  | ItemRemoved<T>

export interface ItemAdded<T> {
  readonly type: "ItemAdded";
  readonly item: T;
}

export interface ItemRemoved<T> {
  readonly type: "ItemRemoved";
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
  const events$ = new Subject<ArrayEvent<T>>();
  return {
    kind: "ObservableArray" as const,

    get events$() {
      const currentItemEvents: ItemAdded<T>[] = items$.value.map((item) => ({
        type: "ItemAdded",
        item,
      }));
      return concat(currentItemEvents, events$);
    },

    get items() {
      return items$.value;
    },

    items$,

    push(item: T) {
      items$.value.push(item);
      items$.next(items$.value);
      events$.next({ type: "ItemAdded", item });
    },

    replaceItem(oldItem: T, newItem: T) {
      const index = this.items.indexOf(oldItem);
      if (index === -1) {
        throw new Error("Item not found");
      }
      this.items$.value[index] = newItem;
      events$.next({ type: "ItemRemoved", item: oldItem });
      events$.next({ type: "ItemAdded", item: newItem });
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
