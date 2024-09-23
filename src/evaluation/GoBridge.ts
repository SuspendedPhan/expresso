import { Effect, Layer, Stream } from "effect";
import { GoModuleCtx } from "src/ctx/GoModuleCtx";
import { Project } from "src/ex-object/Project";
import { EffectUtils } from "src/utils/utils/EffectUtils";
import { log5 } from "src/utils/utils/Log5";

const log55 = log5("GoBridge.ts", 11);

export class GoBridgeCtx extends Effect.Tag("GoBridgeCtx")<
  GoBridgeCtx,
  Effect.Effect.Success<typeof ctxEffect>
>() {}

const ctxEffect = Effect.gen(function* () {
  log55.debug("Starting GoBridgeCtx");

  const goModuleCtx = yield* GoModuleCtx;

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
              log55.debug("Adding RootExObject", evt.item.id);
              goModule.Evaluator.addRootExObject(evt.item.id);
              break;
          }
        });
      });
    })
  );

  // const activeProject = EffectUtils.obsToStream(project$);

  // const exObjectAdded = activeProject.pipe(
  //   Stream.flatMap((project) => project.exObjectAdded, { switch: true })
  // );

  // const propertyAdded = activeProject.pipe(
  //   Stream.flatMap((project) => project.propertyAdded, { switch: true })
  // );

  // const exprAdded = activeProject.pipe(
  //   Stream.flatMap((project) => project.exprAdded, { switch: true })
  // );

  // // Add ExObjects
  // yield* Effect.forkDaemon(
  //   Stream.runForEach(exObjectAdded, (exObject) => {
  //     log55.debug("Processing ExObject", exObject);
  //     return goModuleCtx.withGoModule((goModule) => {
  //       return Effect.gen(function* () {
  //         log55.debug("Adding ExObject", exObject.id);

  //         goModule.ExObject.create(exObject.id);
  //         goModule.ExObject.setCloneCountProperty(
  //           exObject.id,
  //           exObject.cloneCountProperty.id
  //         );

  //         for (const property of exObject.componentParameterProperties) {
  //           goModule.ExObject.addComponentParameterProperty(
  //             exObject.id,
  //             property.id
  //           );
  //         }
  //       });
  //     });
  //   })
  // );

  // // Add Properties
  // yield* Effect.forkDaemon(
  //   Stream.runForEach(propertyAdded, (property) => {
  //     log55.debug("Processing Property", property);
  //     return goModuleCtx.withGoModule((goModule) => {
  //       return Effect.gen(function* () {
  //         log55.debug("Adding Property", property.id);
  //         goModule.Property.create(property.id);
  //         yield* Effect.forkDaemon(
  //           Stream.runForEach(property.expr.changes, (value) => {
  //             return goModuleCtx.withGoModule((goModule_) =>
  //               Effect.gen(function* () {
  //                 goModule_.Property.setExpr(property.id, value.id);
  //               })
  //             );
  //           })
  //         );
  //       });
  //     });
  //   })
  // );

  // // Add Exprs
  // yield* Effect.forkDaemon(
  //   Stream.runForEach(exprAdded, (expr) => {
  //     log55.debug("Processing Expr", expr);
  //     return goModuleCtx.withGoModule((goModule) => {
  //       return Effect.gen(function* () {
  //         log55.debug("Adding Expr", expr.id);
  //         matcher(expr)
  //           .when(ExprFactory.Number, (expr) => {
  //             log55.debug("GoModule: Creating NumberExpr", expr.id);
  //             goModule.NumberExpr.create(expr.id);
  //             goModule.NumberExpr.setValue(expr.id, expr.value);
  //           })
  //           .when(ExprFactory.Reference, (expr_) => {
  //             assert(expr_.target !== null);
  //             goModule.ReferenceExpr.create(
  //               expr_.id,
  //               expr_.target.id,
  //               expr_.target.type
  //             );
  //           })
  //           .when(ExprFactory.Call, (expr) => {
  //             log55.debug("GoModule: Creating CallExpr", expr.id);
  //             goModule.CallExpr.create(expr.id);
  //             Stream.runForEach(expr.args.itemStream, (args) => {
  //               return goModuleCtx.withGoModule((goModule_) =>
  //                 Effect.gen(function* () {
  //                   const arg0 = args[0];
  //                   const arg1 = args[1];

  //                   if (arg0 === undefined || arg1 === undefined) {
  //                     console.error("CallExpr must have 2 args");
  //                     return;
  //                   }

  //                   goModule_.CallExpr.setArg0(expr.id, arg0.id);
  //                   goModule_.CallExpr.setArg1(expr.id, arg1.id);
  //                 })
  //               );
  //             });
  //           })
  //           .complete();
  //       });
  //     });
  //   })
  // );

  log55.debug("GoBridgeCtx init complete");

  return {};
});

export const GoBridgeCtxLive = Layer.effect(GoBridgeCtx, ctxEffect);
