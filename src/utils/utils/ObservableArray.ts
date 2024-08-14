import {
  connect,
  map,
  pipe,
  Subject,
  type UnaryFunction
} from "rxjs";
import type { OBS, SUB } from "src/utils/utils/Utils";

export type ItemChange<T> = ItemAdded<T> | ItemRemoved<T> | InitialSubscription;

export interface ItemAdded<T> {
  readonly type: "ItemAdded";
  readonly item: T;
}

export interface ItemRemoved<T> {
  readonly type: "ItemRemoved";
  readonly item: T;
}

export interface InitialSubscription {
  readonly type: "InitialSubscription";
}

export interface ArrayEvent<T> {
  readonly items: T[];
  readonly change: ItemChange<T>;
}

export namespace ObservableArray {
  export function create<T>(): SUB<ArrayEvent<T>> {
    const subject = new Subject<ArrayEvent<T>>(); 
    return subject;
  }

  export function toArray<T>(): UnaryFunction<OBS<ArrayEvent<T>>, OBS<T[]>> {
    return pipe(
      map((event) => {
        return event.items;
      })
    );
  }

  export function mapToArray<T, R>(
    fn: (item: T) => R
  ): UnaryFunction<OBS<ArrayEvent<T>>, OBS<R[]>> {
    return connect((events$) => {
      const itemrARR: R[] = [];
      const itemrByItemt = new Map<T, R>();
      const result$ = events$.pipe(
        map((event) => {
          switch (event.change.type) {
            case "InitialSubscription": {
              itemrARR.push(...event.items.map(fn));
              break;
            }

            case "ItemAdded": {
              const itemt = event.change.item;
              const itemr = fn(itemt);
              itemrARR.push(itemr);
              itemrByItemt.set(itemt, itemr);
              break;
            }
            case "ItemRemoved": {
              const itemt = event.change.item;
              const itemr = itemrByItemt.get(itemt);
              if (itemr === undefined) {
                throw new Error("Item not found");
              }
              const index = itemrARR.indexOf(itemr);
              if (index === -1) {
                throw new Error("Item not found");
              }
              itemrARR.splice(index, 1);
              itemrByItemt.delete(itemt);
              break;
            }
          }
          return itemrARR;
        })
      );
      return result$;
    });
  }
}
