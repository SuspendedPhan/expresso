// File: ExItem.ts

import { Effect, Exit, Ref, Scope, Stream, SubscriptionRef } from "effect";
import { firstValueFrom, Subject } from "rxjs";
import { type ComponentKind } from "src/ex-object/Component";
import { type CustomExFunc } from "src/ex-object/ExFunc";
import { type ExObject } from "src/ex-object/ExObject";
import { type Expr } from "src/ex-object/Expr";
import { Project, ProjectFactory } from "src/ex-object/Project";
import type { Property } from "src/ex-object/Property";
import { EffectUtils } from "src/utils/utils/EffectUtils";
import { log5 } from "src/utils/utils/Log5";
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

  readonly scope: Scope.Scope;
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
      const scope = yield* Scope.make();
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

      yield* EffectUtils.obsToStream(destroy$).pipe(
        Stream.runForEach(() => {
          return Effect.gen(function* () {
            log55.debug("createExItemBase: Destroying item", id);
            yield* Scope.close(scope, Exit.succeed(void 0));
          });
        }),
        Effect.forkIn(scope)
      );

      const exObjectBase: ExItemBase = {
        id,
        ordinal: 0,
        parent$,
        parent,
        destroy$,
        scope,
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
    console.log("getProject2: item", item.id);
    return item.parent.changes.pipe(
      Stream.flatMap(
        (parent) => {
          // console.log("getProject2: parent", parent?.id ?? "null");
          if (isType(parent, ProjectFactory)) {
            return Stream.make(parent);
          }
          return parent === null ? Stream.empty : ExItem.getProject2(parent);
        },
        { switch: true }
      )
    );
  },

  getProject3(item: ExItem): Effect.Effect<Stream.Stream<Project>> {
    return Effect.gen(function* () {
      console.log("getProject3: item", item.id);
      return item.parent.changes.pipe(
        Stream.flatMap(
          (parent) => {
            // console.log("getProject3: parent", parent?.id ?? "null");
            if (isType(parent, ProjectFactory)) {
              return Stream.make(parent);
            }
            return parent === null
              ? Stream.empty
              : ExItem.getProject3(parent).pipe(Stream.unwrap);
          },
          { switch: true }
        )
      );
    }).pipe(
      Effect.withSpan("ExItem.getProject3", { attributes: { itemId: item.id } })
    );
  },
};
