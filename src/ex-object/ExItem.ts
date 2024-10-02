// File: ExItem.ts

import { Chunk, Effect, PubSub, Ref, Stream, SubscriptionRef } from "effect";
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
  ): Stream.Stream<ItemAdded<Property>> {
    const vv = Stream.flatMap(
      itemEvents,
      (itemEvent) => {
        const vv = this.getPropertyAddedEventsDeep2(itemEvent.item);
        return Stream.unwrap(vv);
      },
      {
        switch: true,
        concurrency: "unbounded",
      }
    );
    return vv;
  },

  getPropertyAddedEventsDeep2(
    exItem: ExItem
  ): Effect.Effect<Stream.Stream<ItemAdded<Property>>> {
    return Effect.gen(this, function* () {
      const pub = yield* PubSub.unbounded<ItemAdded<Property>>();

      yield* Effect.forkDaemon(Stream.runForEach(EffectUtils.obsToStream(exItem.destroy$), (value) => {
        return Effect.gen(function* () {
          yield* pub.shutdown;
          
        });
      }));

      if (isType(exItem, ExObjectFactory)) {
        const vv1 = yield* exItem.componentParameterProperties_.events;
        const vv2 = yield* exItem.basicProperties.events;
        const vv3 = Stream.concat(vv1, vv2);
        const vv4 = Stream.filter(vv3, (event) => event.type === "ItemAdded");
        const vv5 = Stream.concat(
          vv4,
          Stream.succeed({ type: "ItemAdded", item: exItem.cloneCountProperty })
        );

        const cc1 = exItem.children.itemStream;
        // const cc2 = cc1.
        const cc2 = this.getPropertyAddedEventsDeep(cc1);
        return vv5;
      }

      if (isType(exItem, ComponentFactory.Custom)) {
        const vv1 = yield* exItem.properties.events;
        const vv2 = Stream.filter(vv1, (event) => event.type === "ItemAdded");
        return vv2;
      }
    });
  },
};
