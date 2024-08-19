import { map } from "rxjs";
import type { Expr } from "src/ex-object/ExItem";
import type MainContext from "src/main-context/MainContext";
import type { OBS } from "src/utils/utils/Utils";

export type ExprCommandCtx = ReturnType<typeof createExprCommandCtx>;

export interface ExprCommand {
  label: string;
  execute: () => void;
}

export function createExprCommandCtx(ctx: MainContext) {
  return {
    async getReplacementCommands$Prom(expr: Expr, query$: OBS<string>) {
      return query$.pipe(
        map((query) => {
          const value = parseFloat(query);
          if (!isNaN(value)) {
            // ctx.focusManager.focusExItem(expr);
            ctx.mutator.replaceWithNumberExpr(expr, value);
          } else if (query === "+") {
            // ctx.focusManager.focusExItem(expr);
            ctx.mutator.replaceWithCallExpr(expr);
          }
        })
      );
    },
  };
}
