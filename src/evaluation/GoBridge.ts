import { first, Subject } from "rxjs";
import { type Expr, ExprType } from "src/ex-object/ExItem";
import type MainContext from "src/main-context/MainContext";
import { loggedMethod } from "src/utils/logger/LoggerDecorator";
import type GoModule from "src/utils/utils/GoModule";
import { log5 } from "src/utils/utils/Log3";
import { assertUnreachable, partitionFirst } from "src/utils/utils/Utils";

const log55 = log5("GoBridge.ts");

export default class GoBridge {
  private readonly ready$ByExpr = new Map<Expr, Subject<void>>();

  public constructor(goModule: GoModule, ctx: MainContext) {
    if (ctx.disableCanvas) return;
    this.setup(goModule, ctx);
  }

  @loggedMethod
  private async setup(goModule: GoModule, ctx: MainContext) {
    const project = await ctx.projectCtx.getCurrentProjectProm();
    const [first$, rest$] = partitionFirst(project.rootExObjectObsArr.event$);

    first$.subscribe((evt) => {
      evt.items.forEach((rootExObject) => {
        log55.debug("Adding initial rootExObject", rootExObject.id);
        goModule.Evaluator.addRootExObject(rootExObject.id);
      });
    });

    rest$.subscribe((evt) => {
      switch (evt.change.type) {
        case "ItemAdded":
          log55.debug("Adding rootExObject", evt.change.item.id);
          goModule.Evaluator.addRootExObject(evt.change.item.id);
          break;
        case "ItemReplaced":
          goModule.Evaluator.addRootExObject(evt.change.newItem.id);
          break;
        default:
          console.error("Unexpected change type", evt.change);
      }
    });

    ctx.eventBus.objectAdded$.subscribe((object) => {
      log55.debug("Adding ExObject", object.id);
      goModule.ExObject.create(object.id);

      goModule.ExObject.setCloneCountProperty(
        object.id,
        object.cloneCountProperty.id
      );

      for (const property of object.componentParameterProperties) {
        goModule.ExObject.addComponentParameterProperty(object.id, property.id);
      }
    });

    ctx.eventBus.propertyAdded$.subscribe((property) => {
      log55.debug("Adding Property", property.id);
      goModule.Property.create(property.id);
      property.expr$.subscribe((expr) => {
        goModule.Property.setExpr(property.id, expr.id);
      });
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
