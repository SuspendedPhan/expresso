import {
  concat,
  connect,
  first,
  map,
  mergeMap,
  of,
  partition,
  pipe,
  Subject,
  type UnaryFunction,
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
  export function emitItemsOnSubscribe<T>(): OBS<ArrayEvent<T>> {

  }

  export function replayCurrentItems<T>(): UnaryFunction<
    OBS<ArrayEvent<T>>,
    OBS<ArrayEvent<T>>
  > {
    return connect((eventArr$) => {
      const [first$, rest$] = partition(eventArr$, (_event, index) => {
        return index === 0;
      });

      const replay$ = first$.pipe(
        mergeMap((event) => {
          const events = event.items.map((item) => {
            const itemAddedEvent: ArrayEvent<T> = {
              items: [item],
              change: { type: "ItemAdded", item },
            };
            return itemAddedEvent;
          });
          const eventArr$ = of(...events);
          return eventArr$;
        })
      );
      const result = concat(replay$, rest$);
      return result;
    });
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
        replayCurrentItems(),
        map((event) => {
          switch (event.change.type) {
            case "ItemAdded": {
              const itemt = event.change.item;
              const itemr = fn(itemt);
              itemrARR.push(itemr);
              itemrByItemt.set(itemt, itemr);
              return itemrARR;
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
              return itemrARR;
            }
          }
        })
      );
      return result$;
    });
  }
}
