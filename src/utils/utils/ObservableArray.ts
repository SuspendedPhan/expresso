import { Effect, Option, PubSub, Stream, SubscriptionRef } from "effect";
import { concat, map, Subject } from "rxjs";
import { EffectUtils } from "src/utils/utils/EffectUtils";
import {
  createBehaviorSubjectWithLifetime,
  type OBS,
} from "src/utils/utils/Utils";

export type ArrayEvent<T> = ItemAdded<T> | ItemRemoved<T> | ItemReplaced<T>;

export interface ItemAdded<T> {
  readonly type: "ItemAdded";
  readonly item: T;
  readonly onRemove: PubSub.PubSub<void>;
}

export interface ItemRemoved<T> {
  readonly type: "ItemRemoved";
  readonly item: T;
}

export interface ItemReplaced<T> {
  readonly type: "ItemReplaced";
  readonly oldItem: T;
  readonly newItem: T;
}

export type ObservableArray<T> = ReturnType<
  typeof createObservableArrayWithLifetime<T>
>;

export function createObservableArrayWithLifetime<T>(
  destroy$: OBS<void>,
  initialItems: T[] = []
) {
  const items$_ = createBehaviorSubjectWithLifetime(destroy$, initialItems);
  const events$ = new Subject<ArrayEvent<T>>();
  const onRemoveByItem = new Map<T, PubSub.PubSub<void>>();

  function getOrCreateOnRemove(item: T) {
    return Effect.gen(function* () {
      if (!onRemoveByItem.has(item)) {
        onRemoveByItem.set(item, yield* PubSub.unbounded<void>());
      }
      return onRemoveByItem.get(item)!;
    });
  }

  return {
    kind: "ObservableArray" as const,

    get events$() {
      return Effect.gen(function* () {
        const currentItemEvents_: Effect.Effect<ItemAdded<T>>[] =
          items$_.value.map((item) => {
            return Effect.gen(function* () {
              return {
                type: "ItemAdded",
                item,
                onRemove: yield* getOrCreateOnRemove(item),
              };
            });
          });
        const currentItemEvents = yield* Effect.all(currentItemEvents_);
        return concat(currentItemEvents, events$);
      });
    },

    get items() {
      return items$_.value;
    },

    items$: items$_ as OBS<T[]>,

    get itemStream() {
      return EffectUtils.obsToStream(items$_);
    },

    push(item: T) {
      return Effect.gen(function* () {
        items$_.value.push(item);
        items$_.next(items$_.value);
        events$.next({
          type: "ItemAdded",
          item,
          onRemove: yield* getOrCreateOnRemove(item),
        });
      });
    },

    replaceItem(oldItem: T, newItem: T) {
      return Effect.gen(this, function* () {
        const index = this.items.indexOf(oldItem);
        if (index === -1) {
          throw new Error("Item not found");
        }
        items$_.value[index] = newItem;
        items$_.next(items$_.value);

        events$.next({ type: "ItemRemoved", item: oldItem });
        const onRemove = yield* getOrCreateOnRemove(oldItem);
        yield* PubSub.publish(onRemove, void 0);
        onRemoveByItem.delete(oldItem);

        events$.next({
          type: "ItemAdded",
          item: newItem,
          onRemove: yield* getOrCreateOnRemove(newItem),
        });
        events$.next({ type: "ItemReplaced", oldItem, newItem });
      });
    },

    get events() {
      return Effect.gen(this, function* () {
        return EffectUtils.obsToStream(yield* this.events$);
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

export const ObservableArray = {
  syncMap_<K, V>(
    map: Map<K, V>,
    arrayEvents: Stream.Stream<ArrayEvent<V>>,
    getKey: (item: V) => K
  ) {
    return Effect.gen(function* () {
      yield* Stream.runForEach(arrayEvents, (event) => {
        return Effect.gen(function* () {
          switch (event.type) {
            case "ItemAdded": {
              map.set(getKey(event.item), event.item);
              break;
            }
            case "ItemRemoved": {
              map.delete(getKey(event.item));
              break;
            }
          }
        });
      });
    }).pipe(Effect.forkDaemon);
  },

  syncMap<K, V>(
    map: Map<K, V>,
    observableArray: ObservableArray<V>,
    getKey: (item: V) => K
  ) {
    return Effect.gen(function* () {
      (yield* observableArray.events$).subscribe((event) => {
        switch (event.type) {
          case "ItemAdded": {
            map.set(getKey(event.item), event.item);
            break;
          }
          case "ItemRemoved": {
            map.delete(getKey(event.item));
            break;
          }
        }
      });
    });
  },

  /**
   * Maps the items in the event stream. When an item is added,
   */
  mergeMap<T, A>(
    events: Stream.Stream<ArrayEvent<T>>,
    itemToStream: (item: T) => Stream.Stream<A>
  ) {
    return events.pipe(
      Stream.flatMap(
        (evt) => {
          if (evt.type === "ItemAdded") {
            return itemToStream(evt.item);
          }
          return Stream.make();
        },
        { concurrency: "unbounded" }
      )
    );
  },

  fromSubscriptionRef<T>(
    ref: SubscriptionRef.SubscriptionRef<T>
  ): Stream.Stream<ArrayEvent<T>> {
    const vv = ref.changes.pipe(
      Stream.mapAccumEffect(Option.none(), (acc: Option.Option<T>, item: T) => {
        return Effect.gen(function* () {
          const events = new Array<ArrayEvent<T>>();
          if (Option.isSome(acc)) {
            events.push({ type: "ItemRemoved", item: acc.value });
          }
          const addEvent: ArrayEvent<T> | null = {
            type: "ItemAdded",
            item,
            onRemove: yield* PubSub.unbounded<void>(),
          };
          events.push(addEvent);
          return [Option.some(item), Stream.make(...events)];
        });
      }),
      Stream.flatten()
    );
    return vv;
  },
};
