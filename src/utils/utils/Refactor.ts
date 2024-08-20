import { firstValueFrom } from "rxjs";
import { CreateComponent } from "src/ex-object/Component";
import type { Expr } from "src/ex-object/ExItem";
import {
  CreateExObject,
  ExObjectFns,
  type ExObject,
} from "src/ex-object/ExObject";
import { ProjectFns } from "src/ex-object/Project";
import type { BasicProperty } from "src/ex-object/Property";
import type MainContext from "src/main-context/MainContext";

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
      console.log("extractExFunc", expr);
    },

    async extractProperty(expr: Expr) {
      console.log("extractProperty", expr);
    },

    async movePropertyToParent(property: BasicProperty) {
      console.log("movePropertyToParent", property);
    },
  };
}
