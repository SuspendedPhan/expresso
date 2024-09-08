import { Effect } from "effect";
import { first, Subject } from "rxjs";
import { ExObjectCtx } from "src/ctx/ExObjectCtx";
import { GoModuleCtx } from "src/ctx/GoModuleCtx";
import { ProjectCtx } from "src/ctx/ProjectCtx";
import { PropertyCtx } from "src/ctx/PropertyCtx";
import type { Expr } from "src/ex-object/Expr";
import type GoModule from "src/utils/utils/GoModule";
import { log5 } from "src/utils/utils/Log5";
import { assertUnreachable } from "src/utils/utils/Utils";

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

  ctx.eventBus.exprAdded$.subscribe((expr) => {
    switch (expr.exprType) {
      case ExprType.NumberExpr:
        goModule.NumberExpr.create(expr.id);
        goModule.NumberExpr.setValue(expr.id, expr.value);
        break;
      case ExprType.CallExpr:
        goModule.CallExpr.create(expr.id);

        expr.args$.pipe(first()).subscribe((args) => {
          const arg0 = args[0];
          const arg1 = args[1];

          if (arg0 === undefined || arg1 === undefined) {
            // throw new Error("CallExpr must have 2 args");
            console.error("CallExpr must have 2 args");
            return;
          }

          goModule.CallExpr.setArg0(expr.id, arg0.id);
          goModule.CallExpr.setArg1(expr.id, arg1.id);
        });
        break;
      case ExprType.ReferenceExpr:
        console.error("ReferenceExpr not implemented");
        break;
      default:
        assertUnreachable(expr);
    }

    const ready$ = this.getOrCreateReady$(expr);
    ready$.complete();
  });
});

export default class GoBridge {
  private readonly ready$ByExpr = new Map<Expr, Subject<void>>();

  public constructor(goModule: GoModule, ctx: MainContext) {
    if (ctx.disableCanvas) return;
    this.setup(goModule, ctx);
  }

  private getOrCreateReady$(expr: Expr): Subject<void> {
    let ready$ = this.ready$ByExpr.get(expr);
    if (!ready$) {
      ready$ = new Subject();
      this.ready$ByExpr.set(expr, ready$);
    }

    return ready$;
  }
}
