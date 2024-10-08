import assert from "assert-ts";
import { Effect, Layer, Stream } from "effect";
import { EventBusCtx } from "src/ctx/EventBusCtx";
import { GoModuleCtx } from "src/ctx/GoModuleCtx";
import { ExprFactory } from "src/ex-object/Expr";
import { Project } from "src/ex-object/Project";
import { EffectUtils } from "src/utils/utils/EffectUtils";
import { log5 } from "src/utils/utils/Log5";
import { matcher } from "variant";

const log55 = log5("GoBridge.ts");

export class GoBridgeCtx extends Effect.Tag("GoBridgeCtx")<
  GoBridgeCtx,
  Effect.Effect.Success<typeof ctxEffect>
>() {}

const ctxEffect = Effect.gen(function* () {
  log55.debug("Starting GoBridgeCtx");

  const goModuleCtx = yield* GoModuleCtx;
  const eventBusCtx = yield* EventBusCtx;

  const project$ = yield* Project.activeProject$;
  log55.debug("Ctx loaded");

  const project$2 = EffectUtils.obsToStream(project$);
  yield* Effect.forkDaemon(
    Stream.runForEach(project$2, () => {
      return goModuleCtx.withGoModule((goModule) => {
        return Effect.gen(function* () {
          log55.debug("Resetting GoModule");
          goModule.Evaluator.reset();
        });
      });
    })
  );

  const rootExObjectEvents = project$2.pipe(
    Stream.flatMap((project) => Stream.unwrap(project.rootExObjects.events), {
      switch: true,
    })
  );
  yield* Effect.forkDaemon(
    Stream.runForEach(rootExObjectEvents, (evt) => {
      return goModuleCtx.withGoModule((goModule) => {
        return Effect.gen(function* () {
          switch (evt.type) {
            case "ItemAdded":
              log55.debug("Adding RootExObject");
              goModule.Evaluator.addRootExObject(evt.item.id);
              break;
          }
        });
      });
    })
  );

  const exObjectAdded = yield* eventBusCtx.exObjectAddedForActiveProject();
  let exObjectCounter = 0;
  yield* Effect.forkDaemon(
    Stream.runForEach(exObjectAdded, (exObject) => {
      return Effect.gen(function* () {
        log55.debug(
          "Adding ExObject to Go: received from upstream: ex-object has been added"
        );
        return yield* goModuleCtx.withGoModule((goModule) => {
          return Effect.gen(function* () {
            log55.log3(14, "Go: Adding Object" + ++exObjectCounter);

            goModule.ExObject.create(exObject.id);
            goModule.ExObject.setCloneCountProperty(
              exObject.id,
              exObject.cloneCountProperty.id
            );

            for (const property of exObject.componentParameterProperties) {
              goModule.ExObject.addComponentParameterProperty(
                exObject.id,
                property.id
              );
            }

            yield* Effect.forkDaemon(
              Stream.runForEach(
                yield* exObject.basicProperties.events,
                (value) => {
                  return Effect.gen(function* () {
                    if (value.type === "ItemAdded") {
                      goModule.ExObject.addBasicProperty(
                        exObject.id,
                        value.item.id
                      );
                    } else {
                      console.error("Not implemented");
                    }
                  });
                }
              )
            );

            yield* Effect.forkDaemon(
              Stream.runForEach(yield* exObject.children.events, (value) => {
                return Effect.gen(function* () {
                  if (value.type === "ItemAdded") {
                    goModule.ExObject.create(value.item.id);
                    goModule.ExObject.addChild(exObject.id, value.item.id);
                  } else {
                    console.error("Not implemented");
                  }
                });
              })
            );

            goModule.ExObject.setCloneNumberTarget(
              exObject.id,
              exObject.cloneNumberTarget.id
            );
          });
        });
      });
    })
  );

  const propertyAdded = yield* eventBusCtx.propertyAddedForActiveProject();
  let propertyCounter = 0;
  yield* Effect.forkDaemon(
    Stream.runForEach(propertyAdded, (property) => {
      return Effect.gen(function* () {
        log55.debug(
          "Adding Property to Go: received from upstream: property has been added"
        );
        return yield* goModuleCtx.withGoModule((goModule) => {
          return Effect.gen(function* () {
            log55.log3(
              14,
              "Go: Adding Property " + ++propertyCounter,
              property.id
            );

            goModule.Property.create(property.id);
            yield* Effect.forkDaemon(
              Stream.runForEach(property.expr.changes, (value) => {
                return goModuleCtx.withGoModule((goModule_) =>
                  Effect.gen(function* () {
                    log55.log3(
                      14,
                      "Go: Setting Expr for Property",
                      property.id,
                      value.id
                    );
                    goModule_.Property.setExpr(property.id, value.id);
                  })
                );
              })
            );
          });
        });
      });
    })
  );

  const exprAdded = yield* eventBusCtx.exprAddedForActiveProject();
  let exprCounter = 0;
  yield* Effect.forkDaemon(
    Stream.runForEach(exprAdded, (expr) => {
      return Effect.gen(function* () {
        log55.debug(
          "Adding Expr to Go: received from upstream: expr has been added"
        );
        return yield* goModuleCtx.withGoModule((goModule) => {
          return Effect.gen(function* () {
            // log55.log3(14, "Go: Adding Expr " + ++exprCounter);
            log55.log3(14, `Go: Adding Expr ${++exprCounter} ${expr.type}`);

            yield* matcher(expr)
              .when(ExprFactory.Number, (expr) => {
                return Effect.gen(function* () {
                  log55.debug("GoModule: Creating NumberExpr", expr.id);
                  goModule.NumberExpr.create(expr.id);
                  goModule.NumberExpr.setValue(expr.id, expr.value);
                });
              })
              .when(ExprFactory.Reference, (expr_) => {
                return Effect.gen(function* () {
                  log55.debug("GoModule: Creating ReferenceExpr", expr_.id);
                  assert(expr_.target !== null);
                  const targetId = expr_.target.id;

                  goModule.ReferenceExpr.create(
                    expr_.id,
                    targetId,
                    expr_.target.type
                  );
                });
              })
              .when(ExprFactory.Call, (expr) => {
                return Effect.forkDaemon(
                  Effect.gen(function* () {
                    log55.debug("GoModule: Creating CallExpr", expr.id);
                    goModule.CallExpr.create(expr.id);
                    yield* Effect.forkDaemon(
                      Stream.runForEach(expr.args.itemStream, (args) => {
                        log55.debug2(
                          "Setting CallExpr args: received args from upstream"
                        );
                        return goModuleCtx.withGoModule((goModule_) =>
                          Effect.gen(function* () {
                            const arg0 = args[0];
                            const arg1 = args[1];

                            if (arg0 === undefined || arg1 === undefined) {
                              console.error("CallExpr must have 2 args");
                              return;
                            }

                            log55.log3(14, "Go: Setting CallExpr args");
                            goModule_.CallExpr.setArg0(expr.id, arg0.id);
                            goModule_.CallExpr.setArg1(expr.id, arg1.id);
                          })
                        );
                      })
                    );
                  })
                );
              })
              .complete();
          });
        });
      });
    })
  );

  yield* project$2.pipe(
    Stream.flatMap(
      (project) => project.components.itemAddedStream.pipe(Stream.unwrap),
      {
        switch: true,
      }
    ),
    Stream.runForEach((event) => {
      return Effect.gen(function* () {
        const goModule = yield* goModuleCtx.getUnsafe();
        const component = event.item;
        log55.log3(14, "Go: Adding Component", component.id);
        goModule.Component.create(component.id);
        component.parameters.itemAddedStream.pipe(
          Stream.runForEach((event) => {
            return Effect.gen(function* () {
              log55.log3(14, "Go: Component: Adding Parameter", event.item.id);
              goModule.Component.addParameterProperty(component.id, event.item.id);
            });
          }),
          Effect.forkDaemon
        );
      });
    }),
    Effect.forkDaemon
  );

  return {};
});

export const GoBridgeCtxLive = Layer.effect(GoBridgeCtx, ctxEffect);
