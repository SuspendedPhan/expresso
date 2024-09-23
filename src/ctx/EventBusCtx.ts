import { Effect, Layer, PubSub, Stream } from "effect";
import type { LibraryProjectCtx } from "src/ctx/LibraryProjectCtx";
import { ExItem } from "src/ex-object/ExItem";
import { ExObject } from "src/ex-object/ExObject";
import type { Expr } from "src/ex-object/Expr";
import { Project } from "src/ex-object/Project";
import type { Property } from "src/ex-object/Property";

export class EventBusCtx extends Effect.Tag("EventBusCtx")<
  EventBusCtx,
  Effect.Effect.Success<typeof ctxEffect>
>() {}

const ctxEffect = Effect.gen(function* () {
  return {
    exObjectAdded: yield* PubSub.unbounded<ExObject>(),
    propertyAdded: yield* PubSub.unbounded<Property>(),
    exprAdded: yield* PubSub.unbounded<Expr>(),

    exObjectAddedForActiveProject(): Effect.Effect<
      Stream.Stream<ExObject>,
      never,
      LibraryProjectCtx
    > {
      return Effect.gen(this, function* () {
        const vv = yield* Project.activeProjectStream;
        const vv2 = vv.pipe(
          Stream.flatMap(
            (project) => {
              return Stream.unwrap(Effect.gen(this, function* () {
                const currentExObjects: ExObject[] =
                  yield* Project.getExObjects(project);
                const exObjectAdded = Stream.fromPubSub(
                  this.exObjectAdded
                ).pipe(
                  Stream.filterEffect((exObject) => {
                    return Effect.gen(function* () {
                      const project2 = yield* ExItem.getProject(exObject);
                      return project2 === project;
                    });
                  })
                );
                const currentExObjects2 = Stream.make(...currentExObjects);
                const result = Stream.concat(currentExObjects2, exObjectAdded);
                return result;
              }));
            },
            { switch: true }
          )
        );
        return vv2;
      });
    },
  };
});

export const EventBusCtxLive = Layer.effect(EventBusCtx, ctxEffect);
