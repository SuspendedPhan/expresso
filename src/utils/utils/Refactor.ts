import { firstValueFrom } from "rxjs";
import { CreateComponent } from "src/ex-object/Component";
import { CreateExObject, ExObjectFns, type ExObject } from "src/ex-object/ExObject";
import { ProjectFns } from "src/ex-object/Project";
import type MainContext from "src/main-context/MainContext";

export function createRefactorContext(ctx: MainContext) {
  return {
    async extractComponent(exObject: ExObject) {
      const project = await firstValueFrom(ctx.projectCtx.currentProject$);
      const component = await CreateComponent.customFrom(ctx, [exObject]);
      ProjectFns.addComponent(ctx, project, component);
      
      const name = await firstValueFrom(exObject.name$);
      const newExObject = await CreateExObject.blank(ctx, {
        component,
        name,
      });
      ExObjectFns.replaceExObject(ctx, exObject, newExObject);
    },
  };
}
