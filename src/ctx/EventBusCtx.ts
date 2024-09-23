import { Effect, Layer, PubSub, Stream } from "effect";
import type { LibraryProjectCtx } from "src/ctx/LibraryProjectCtx";
import { ExItem } from "src/ex-object/ExItem";
import { ExObject } from "src/ex-object/ExObject";
import type { Expr } from "src/ex-object/Expr";
import { Project } from "src/ex-object/Project";
import type { Property } from "src/ex-object/Property";
import { log5 } from "src/utils/utils/Log5";

const log55 = log5("EventBusCtx.ts", 11);

export class EventBusCtx extends Effect.Tag("EventBusCtx")<
  EventBusCtx,
  Effect.Effect.Success<typeof ctxEffect>
>() {}

const ctxEffect = Effect.gen(function* () {
  const result = {
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
              return Stream.unwrap(this.exObjectAddedForProject(project));
            },
            { switch: true }
          )
        );
        return vv2;
      });
    },

    exObjectAddedForProject(project: Project) {
      return Effect.gen(this, function* () {
        log55.debug("exObjectAddedForProject", project);
        const currentExObjects: ExObject[] = yield* Project.getExObjects(
          project
        );
        const exObjectAdded = Stream.fromPubSub(this.exObjectAdded).pipe(
          Stream.filterEffect((exObject) => {
            return Effect.gen(function* () {
              const project2 = yield* ExItem.getProject(exObject);
              const result = project2 === project;
              log55.debug("exObjectAddedForProject.filterEffect", exObject, result);
              return result;
            });
          })
        );
        const currentExObjects2 = Stream.make(...currentExObjects);
        const result = Stream.concat(currentExObjects2, exObjectAdded);
        return result;
      });
    },
  };

  yield* Effect.forkDaemon(
    Stream.runForEach(yield* result.exObjectAddedForActiveProject(), (value) => {
      return Effect.gen(function* () {
        log55.debug("exObjectAdded", value);
      });
    })
  );

  log55.debug("EventBusCtx created");
  return result;
});

export const EventBusCtxLive = Layer.effect(EventBusCtx, ctxEffect);
