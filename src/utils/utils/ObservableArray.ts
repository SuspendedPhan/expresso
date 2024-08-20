import {
  map
} from "rxjs";
import { createBehaviorSubjectWithLifetime, type OBS } from "src/utils/utils/Utils";

export type ItemChange<T> = ItemAdded<T> | ItemRemoved<T> | InitialSubscription | ItemReplaced<T>;

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

export function createObservableArrayWithLifetime<T>(destroy$: OBS<void>, initialItems: T[] = []) {
  const event: ArrayEvent<T> = {
    change: { type: "InitialSubscription" },
    items: initialItems,
  };
  return {
    event$: createBehaviorSubjectWithLifetime<ArrayEvent<T>>(destroy$, event),

    get itemArr() {
      return this.event$.getValue().items;
    },

    get itemArr$() {
      return this.event$.pipe(map((evt) => evt.items));
    },

    push(item: T) {
      this.itemArr.push(item);
      this.event$.next({
        change: { type: "ItemAdded", item },
        items: this.itemArr,
      });
    },

    replaceItem(oldItem: T, newItem: T) {
      const index = this.itemArr.indexOf(oldItem);
      if (index === -1) {
        throw new Error("Item not found");
      }
      this.itemArr[index] = newItem;
      this.event$.next({
        change: { type: "ItemReplaced", newItem, oldItem },
        items: this.itemArr,
      });
    },
  };
}
