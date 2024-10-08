import { Effect, Layer, Logger, LogLevel, PubSub, Stream } from "effect";
import type { LibraryProjectCtx } from "src/ctx/LibraryProjectCtx";
import { ExItem } from "src/ex-object/ExItem";
import { ExObject } from "src/ex-object/ExObject";
import type { Expr } from "src/ex-object/Expr";
import { Project } from "src/ex-object/Project";
import type { Property } from "src/ex-object/Property";
import { log5 } from "src/utils/utils/Log5";

const log55 = log5("EventBusCtx.ts");

export class EventBusCtx extends Effect.Tag("EventBusCtx")<
  EventBusCtx,
  Effect.Effect.Success<typeof ctxEffect>
>() {}

const ctxEffect = Effect.gen(function* () {
  const exObjectAdded = yield* PubSub.unbounded<ExObject>();

  return {
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

        yield* Effect.forkDaemon(
          Stream.runForEach(Stream.fromPubSub(exObjectAdded), (value) => {
            return Effect.gen(function* () {
              console.log("EventBus: received exObjectAdded raw stream2", value.id);
            });
          })
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

    propertyAddedForActiveProject(): Effect.Effect<
      Stream.Stream<Property>,
      never,
      LibraryProjectCtx
    > {
      const vv = Effect.gen(this, function* () {
        const project = yield* Project.activeProjectStream;

        // Flatmap the active project to the property added stream
        const result = project.pipe(
          Stream.flatMap(
            (project) => {
              return Stream.unwrap(this.propertyAddedForProject(project));
            },
            { switch: true }
          )
        );
        return result;
      });
      return vv;
    },

    propertyAddedForProject(project: Project) {
      return Effect.gen(this, function* () {
        const currentProperties: Property[] = yield* Project.getProperties(
          project
        );

        const propertyAdded_ = Stream.fromPubSub(this.propertyAdded).pipe(
          Stream.filterEffect((property) => {
            return Effect.gen(function* () {
              const project2 = yield* ExItem.getProject(property);
              return project2 === project;
            });
          })
        );

        const currentProperties2 = Stream.make(...currentProperties);
        return Stream.merge(currentProperties2, propertyAdded_);
      });
    },

    exprAddedForActiveProject(): Effect.Effect<
      Stream.Stream<Expr>,
      never,
      LibraryProjectCtx
    > {
      const extracted = Effect.gen(this, function* () {
        const project = yield* Project.activeProjectStream;
        const result: Stream.Stream<Expr> = project.pipe(
          Stream.flatMap(
            (project) => {
              return Stream.unwrap(this.exprAddedForProject(project));
            },
            { switch: true }
          )
        );
        return result;
      });
      return extracted;
    },

    exprAddedForProject(project: Project) {
      return Effect.gen(this, function* () {
        const currentExprs: Expr[] = yield* Project.getExprs(project);

        const exprAdded_ = Stream.fromPubSub(this.exprAdded).pipe(
          Stream.tap((expr) => {
            return Effect.gen(function* () {
              log55.debug(
                "Generating stream: 'Expr added' for specific project: received expr from upstream: " +
                  expr.type
              );
            });
          }),
          Stream.filterEffect((expr) => {
            return Effect.gen(function* () {
              log55.debug(
                "Generating stream: 'Expr added' for specific project: filter: getting project"
              );
              // NumberExpr attaches to CallExpr first. CallExpr has no parent yet.
              const project2 = yield* ExItem.getProject(expr);
              log55.debug(
                "Generating stream: 'Expr added' for specific project: filter: got project"
              );
              return project2 === project;
            });
          }),
          Stream.tap((_) => {
            return Effect.gen(function* () {
              log55.debug(
                "Generating stream: 'Expr added' for specific project: post filter"
              );
            });
          })
        );

        const currentExprs2 = Stream.make(...currentExprs);
        return Stream.merge(currentExprs2, exprAdded_);
      });
    },
  };
});

export const EventBusCtxLive = Layer.effect(EventBusCtx, ctxEffect.pipe(Logger.withMinimumLogLevel(LogLevel.Debug)));
