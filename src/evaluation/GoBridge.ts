import assert from "assert-ts";
import { Effect, Layer, Stream } from "effect";
import { first, switchMap } from "rxjs";
import { ExprCtx } from "src/ctx/ExprCtx";
import { GoModuleCtx } from "src/ctx/GoModuleCtx";
import type { ExObject } from "src/ex-object/ExObject";
import { ExprFactory } from "src/ex-object/Expr";
import { Project } from "src/ex-object/Project";
import { EffectUtils } from "src/utils/utils/EffectUtils";
import { log5 } from "src/utils/utils/Log5";
import type { ArrayEvent } from "src/utils/utils/ObservableArray";
import { matcher } from "variant";

const log55 = log5("GoBridge.ts");

export class GoBridgeCtx extends Effect.Tag("GoBridgeCtx")<
  GoBridgeCtx,
  Effect.Effect.Success<typeof ctxEffect>
>() {}

const ctxEffect = Effect.gen(function* () {
  log55.debug("Starting GoBridgeCtx");

  const goModuleCtx = yield* GoModuleCtx;
  const project$ = yield* Project.activeProject$;
  const exprCtx = yield* ExprCtx;
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

  const rootExObjectEvents$_ = project$.pipe(
    switchMap((project) => project.rootExObjects.events$)
  );

  const rootExObjectEvents$ = EffectUtils.obsToStream(rootExObjectEvents$_);
  yield* Effect.forkDaemon(
    Stream.runForEach(rootExObjectEvents$, (evt) => {
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

  // Get the exObjectEvents from the project
  const activeProject = EffectUtils.obsToStream(project$);

  const exObjectEvents = activeProject.pipe(
    Stream.flatMap((project) => Stream.fromEffect(project.exObjectEvents), {
      switch: true,
    }),
    Stream.flatMap((exObjectEvents) => exObjectEvents, { switch: true })
  );

  yield* Effect.forkDaemon(
    Stream.runForEach(exObjectEvents, (evt) => {
      log55.debug("Processing ExObject event", evt.type);
      return goModuleCtx.withGoModule((goModule) => {
        return Effect.gen(function* () {
          switch (evt.type) {
            case "ItemAdded":
              const exObject = evt.item;
              log55.debug("Adding ExObject", exObject.id);

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

              break;
          }
        });
      });
    })
  );

  const propertyEvents$ = EffectUtils.obsToStream(
    project$.pipe(switchMap((project) => project.properties.events$))
  );

  yield* Effect.forkDaemon(
    Stream.runForEach(propertyEvents$, (evt) => {
      return goModuleCtx.withGoModule((goModule) => {
        return Effect.gen(function* () {
          switch (evt.type) {
            case "ItemAdded":
              const property = evt.item;
              log55.debug("Adding Property", property.id);
              goModule.Property.create(property.id);
              property.expr$.subscribe((expr) => {
                goModule.Property.setExpr(property.id, expr.id);
              });
              break;
          }
        });
      });
    })
  );

  const exprEvents$ = EffectUtils.obsToStream(exprCtx.exprs.events$);
  yield* Effect.forkDaemon(
    Stream.runForEach(exprEvents$, (evt) => {
      return goModuleCtx.withGoModule((goModule) => {
        return Effect.gen(function* () {
          if (evt.type !== "ItemAdded") return;

          const expr = evt.item;

          matcher(expr)
            .when(ExprFactory.Number, (expr) => {
              goModule.NumberExpr.create(expr.id);
              goModule.NumberExpr.setValue(expr.id, expr.value);
            })
            .when(ExprFactory.Reference, (expr_) => {
              assert(expr_.target !== null);
              goModule.ReferenceExpr.create(
                expr_.id,
                expr_.target.id,
                expr_.target.type
              );
            })
            .when(ExprFactory.Call, (expr) => {
              goModule.CallExpr.create(expr.id);
              expr.args$.pipe(first()).subscribe((args) => {
                const arg0 = args[0];
                const arg1 = args[1];

                if (arg0 === undefined || arg1 === undefined) {
                  console.error("CallExpr must have 2 args");
                  return;
                }

                goModule.CallExpr.setArg0(expr.id, arg0.id);
                goModule.CallExpr.setArg1(expr.id, arg1.id);
              });
            })
            .complete();
        });
      });
    })
  );

  log55.debug("GoBridgeCtx init complete");

  return {};
});

export const GoBridgeCtxLive = Layer.effect(GoBridgeCtx, ctxEffect);
