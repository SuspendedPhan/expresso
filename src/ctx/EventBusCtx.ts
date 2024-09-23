import { Effect, Layer, PubSub, Stream } from "effect";
import type { LibraryProjectCtx } from "src/ctx/LibraryProjectCtx";
import { ExItem } from "src/ex-object/ExItem";
import { ExObject } from "src/ex-object/ExObject";
import type { Expr } from "src/ex-object/Expr";
import { Project } from "src/ex-object/Project";
import type { Property } from "src/ex-object/Property";
import { log5 } from "src/utils/utils/Log5";

const log55 = log5("EventBusCtx.ts", 10);

export class EventBusCtx extends Effect.Tag("EventBusCtx")<
  EventBusCtx,
  Effect.Effect.Success<typeof ctxEffect>
>() {}

const ctxEffect = Effect.gen(function* () {
  const exObjectAdded = yield* PubSub.unbounded<ExObject>();
  const result = {
    // todp: rename to attached
    exObjectAdded,
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
          Stream.tap((_) =>
            Effect.succeed(
              log55.debug(
                "Generating stream: 'Ex-Object added' for active project: received active project from upstream"
              )
            )
          ),
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
        log55.debug(
          "Generating stream: 'Ex-Object added' for specific project: starting"
        );
        const currentExObjects: ExObject[] = yield* Project.getExObjects(
          project
        );

        log55.debug(
          "Generating stream: 'Ex-Object added' for specific project: got current ex-objects"
        );

        const exObjectAdded_ = Stream.fromPubSub(this.exObjectAdded)
          .pipe(
            Stream.tap((_) => {
              return Effect.gen(function* () {
                log55.debug(
                  "Generating stream: 'Ex-Object added' for specific project: received ex-object from upstream"
                );
              }).pipe(Effect.withSpan("exObjectAddedForProject.tap"));
            }),
            Stream.filterEffect((exObject) => {
              return Effect.gen(function* () {
                log55.debug("exObjectAddedForProject.filterEffect1", exObject);
                const project2 = yield* ExItem.getProject(exObject);
                const result = project2 === project;
                log55.debug(
                  "exObjectAddedForProject.filterEffect2",
                  exObject,
                  result
                );
                return result;
              });
            })
          )
          .pipe(Stream.withSpan("exObjectAdded"));

        yield* Effect.forkDaemon(
          Stream.runForEach(Stream.fromPubSub(this.exObjectAdded), (value) => {
            return Effect.gen(function* () {
              log55.debug("exObjectAddedForProject: exObjectAdded", value);
            });
          })
        );

        const currentExObjects2 = Stream.make(...currentExObjects);
        const result = Stream.merge(currentExObjects2, exObjectAdded_);
        return result;
      }).pipe(Effect.withSpan("EventBusCtx.exObjectAddedForProject"));
    },
  };

  yield* Effect.forkDaemon(
    Stream.runForEach(
      yield* result.exObjectAddedForActiveProject(),
      () => {
        return Effect.gen(function* () {
          log55.debug2("Received: ex-object has been added for the active project");
        });
      }
    )
  );

  // inspect this
  yield* Effect.forkDaemon(
    Stream.runForEach(Stream.fromPubSub(result.exObjectAdded), (value) => {
      return Effect.gen(function* () {
        log55.debug("exObjectAdded___", value);
      });
    })
  );

  log55.debug("EventBusCtx created");
  return result;
});

export const EventBusCtxLive = Layer.effect(EventBusCtx, ctxEffect);
