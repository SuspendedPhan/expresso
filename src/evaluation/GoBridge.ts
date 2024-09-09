import { Effect, Layer } from "effect";
import { first } from "rxjs";
import { ExObjectCtx, ExObjectCtxLive } from "src/ctx/ExObjectCtx";
import { ExprCtx, ExprCtxLive } from "src/ctx/ExprCtx";
import { GoModuleCtx, GoModuleCtxLive } from "src/ctx/GoModuleCtx";
import { ProjectCtx, ProjectCtxLive } from "src/ctx/ProjectCtx";
import { PropertyCtx, PropertyCtxLive } from "src/ctx/PropertyCtx";
import { ExprFactory } from "src/ex-object/Expr";
import { log5 } from "src/utils/utils/Log5";
import { matcher } from "variant";

const log55 = log5("GoBridge.ts");

const startGoBridge_ = Effect.gen(function* () {
  const projectCtx = yield* ProjectCtx;
  const goModuleCtx = yield* GoModuleCtx;
  const exObjectCtx = yield* ExObjectCtx;
  const goModule = yield* goModuleCtx.goModule;
  const project = yield* projectCtx.activeProject;
  const propertyCtx = yield* PropertyCtx;

  project.rootExObjects.events$.subscribe((evt) => {
    switch (evt.type) {
      case "ItemAdded":
        goModule.Evaluator.addRootExObject(evt.item.id);
        break;
    }
  });

  exObjectCtx.exObjects.events$.subscribe((evt) => {
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

  propertyCtx.properties.events$.subscribe((evt) => {
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

  (yield* ExprCtx).exprs.events$.subscribe((evt) => {
    if (evt.type !== "ItemAdded") return;

    const expr = evt.item;

    matcher(expr)
      .when(ExprFactory.Number, (expr) => {
        goModule.NumberExpr.create(expr.id);
        goModule.NumberExpr.setValue(expr.id, expr.value);
      })
      .when(ExprFactory.Reference, (_expr) => {
        console.error("ReferenceExpr not implemented");
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

const layers = GoModuleCtxLive.pipe(
  Layer.merge(ProjectCtxLive),
  Layer.merge(ExprCtxLive),
  Layer.merge(ExObjectCtxLive),
  Layer.merge(PropertyCtxLive)
);

export const startGoBridge = Effect.provide(startGoBridge_, layers);
