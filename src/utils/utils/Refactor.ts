import { firstValueFrom } from "rxjs";
import {
  createCallExprBase,
  createCustomCallExpr,
} from "src/ex-object/CallExpr";
import { CreateComponent } from "src/ex-object/Component";
import { createExFunc as createCustomExFunc } from "src/ex-object/ExFunc";
import type { Expr } from "src/ex-object/ExItem";
import {
  CreateExObject,
  ExObjectFns,
  type ExObject,
} from "src/ex-object/ExObject";
import { ProjectFns } from "src/ex-object/Project";
import type { BasicProperty } from "src/ex-object/Property";
import type MainContext from "src/main-context/MainContext";
import { log5 } from "src/utils/utils/Log5";

const log55 = log5("Refactor.ts");

export function createRefactorContext(ctx: MainContext) {
  return {
    async extractComponent(exObject: ExObject) {
      const project = await firstValueFrom(ctx.projectCtx.currentProject$);
      const component = await CreateComponent.custom(ctx, {
        rootExObjects: [exObject],
      });
      ProjectFns.addComponent(ctx, project, component);

      const name = await firstValueFrom(exObject.name$);
      const newExObject = await CreateExObject.blank(ctx, {
        component,
        name,
      });
      ExObjectFns.replaceExObject(ctx, exObject, newExObject);
    },

    async extractExFunc(expr: Expr) {
      const parent = await firstValueFrom(expr.parent$);
      
      const exFunc = await createCustomExFunc(ctx, {
        expr,
      });

      const project = await ctx.projectCtx.getCurrentProjectProm();
      project.addCustomExFunc(exFunc);

      const callExprBase = await createCallExprBase(ctx, {});
      const callExpr = await createCustomCallExpr(ctx, {
        exFunc,
        base: callExprBase,
      });

      ctx.mutator.replaceExpr2(parent, expr, callExpr);
    },

    async extractProperty(expr: Expr) {
      log55.debug("extractProperty", expr);
    },

    async movePropertyToParent(property: BasicProperty) {
      log55.debug("movePropertyToParent", property);
    },
  };
}
