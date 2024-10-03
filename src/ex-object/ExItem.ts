// File: ExItem.ts

import {
  Chunk,
  Effect,
  PubSub,
  Queue,
  Ref,
  Scope,
  Stream,
  SubscriptionRef,
} from "effect";
import { firstValueFrom, Subject } from "rxjs";
import { ComponentFactory, type ComponentKind } from "src/ex-object/Component";
import { type CustomExFunc } from "src/ex-object/ExFunc";
import { ExObjectFactory, type ExObject } from "src/ex-object/ExObject";
import { type Expr } from "src/ex-object/Expr";
import { Project, ProjectFactory } from "src/ex-object/Project";
import type { Property } from "src/ex-object/Property";
import { EffectUtils } from "src/utils/utils/EffectUtils";
import { log5 } from "src/utils/utils/Log5";
import type { ArrayEvent, ItemAdded } from "src/utils/utils/ObservableArray";
import {
  createBehaviorSubjectWithLifetime,
  type SUB,
} from "src/utils/utils/Utils";
import { isType } from "variant";

const log55 = log5("ExItem.ts", 10);

export type ExItem =
  | Project
  | ComponentKind["Custom"]
  | ExObject
  | Expr
  | CustomExFunc
  | Property;
export type Parent = ExItem | null;

export interface ExItemBase {
  readonly id: string;
  readonly ordinal: number;
  readonly parent$: SUB<Parent>;

  /**
   * Readonly. Use `parent$` to change the parent.
   */
  readonly parent: SubscriptionRef.SubscriptionRef<Parent>;

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

      const parent$ = createBehaviorSubjectWithLifetime<Parent>(destroy$, null);
      const parent = yield* SubscriptionRef.make<Parent>(null);
      yield* Effect.forkDaemon(
        Stream.runForEach(EffectUtils.obsToStream(parent$), (value) => {
          return Effect.gen(function* () {
            log55.debug(
              "createExItemBase: Setting parent (item, parent)",
              id,
              value
            );
            yield* Ref.set(parent, value);
          });
        })
      );

      const exObjectBase: ExItemBase = {
        id,
        ordinal: 0,
        parent$,
        parent,
        destroy$,
      };
      return exObjectBase;
    });
  },

  getProject(item: ExItem): Effect.Effect<Project> {
    return Effect.gen(function* () {
      if (isType(item, ProjectFactory)) {
        log55.debug("getProject: Returning project", item);
        return item;
      }
      const parent = yield* item.parent.get;
      if (parent === null) {
        log55.debug("getProject: No parent found for item", item);
        throw new Error("No parent found for item");
      }
      log55.debug("getProject: Getting project for parent", parent);
      return yield* ExItem.getProject(parent);
    });
  },

  getProject2(item: ExItem): Stream.Stream<Project> {
    return item.parent.changes.pipe(
      Stream.flatMap((parent) => {
        if (isType(parent, ProjectFactory)) {
          return Stream.make(parent);
        }
        return parent === null ? Stream.empty : ExItem.getProject2(parent);
      })
    );
  },

  getPropertyAddedEventsDeep(
    itemEvents: Stream.Stream<ItemAdded<ExItem>>
  ): Effect.Effect<Stream.Stream<ItemAdded<ExItem>>> {
    return Effect.gen(this, function* () {
      const pubsub = yield* PubSub.unbounded<ItemAdded<ExItem>>();

      yield* Effect.forkDaemon(
        Stream.runForEach(itemEvents, (event) => {
          return Effect.forkDaemon(
            Effect.gen(this, function* () {
              const events = yield* this.getPropertyAddedEventsDeep2(
                event.item
              );

              while (!events.isShutdown) {
                const event_ = yield* Queue.take(events);
                pubsub.publish(event_);
              }
            })
          );
        })
      );

      const vv = Stream.fromPubSub(pubsub);
      return vv;
    });
  },

  getPropertyAddedEventsDeep2(
    exItem: ExItem
  ): Effect.Effect<Stream.Stream<ItemAdded<ExItem>>> {
    return Effect.gen(this, function* () {
      const pub = yield* PubSub.unbounded<ItemAdded<Property>>();

      yield* Effect.forkDaemon(
        Stream.runForEach(EffectUtils.obsToStream(exItem.destroy$), () => {
          return Effect.gen(function* () {
            yield* pub.shutdown;
          });
        })
      );

      if (isType(exItem, ExObjectFactory)) {
        const vv1 = yield* exItem.componentParameterProperties_.events;
        const vv2 = yield* exItem.basicProperties.events;
        const vv3 = Stream.merge(vv1, vv2);
        const vv4 = Stream.filter(vv3, (event) => event.type === "ItemAdded");
        const vv5 = Stream.merge(
          vv4,
          Stream.succeed({ type: "ItemAdded", item: exItem.cloneCountProperty })
        );

        const cc1 = yield* exItem.children.events;
        const cc2 = Stream.filter(
          cc1,
          (event) => event.type === "ItemAdded"
        );

        const cc3 = Stream.merge(vv5, cc2);
        
        const cc4 = Stream.flatMap(cc3, (event) => {
          return Stream.unwrap(this.getPropertyAddedEventsDeep2(event.item));
        }, {
          switch: true,
          concurrency: "unbounded",
        });
        return cc4;
      }

      if (isType(exItem, ComponentFactory.Custom)) {
        const vv1 = yield* exItem.properties.events;
        const vv2 = Stream.filter(vv1, (event) => event.type === "ItemAdded");

        const cc1 = yield* exItem.rootExObjects.events;
        const cc2 = Stream.filter(
          cc1,
          (event) => event.type === "ItemAdded"
        );
        const cc3 = Stream.merge(vv2, cc2);
        
        return vv2;
      }

      console.error("Unknown type");
      throw new Error("Unknown type");
    });
  },
};
