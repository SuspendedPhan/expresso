import { firstValueFrom } from "rxjs";
import { ComponentFns } from "src/ex-object/Component";
import type { ExObject } from "src/ex-object/ExObject";
import { ProjectFns } from "src/ex-object/Project";
import type MainContext from "src/main-context/MainContext";

export function createRefactorContext(ctx: MainContext) {
  return {
    async extractComponent(exObject: ExObject) {
      const project = await firstValueFrom(ctx.projectCtx.currentProject$);
      const component = await ProjectFns.addComponentBlank(ctx, project);
    },
  };
}
