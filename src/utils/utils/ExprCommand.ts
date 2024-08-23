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
    getReplacementCommands$(expr: Expr, query$: OBS<string>) {
      return query$.pipe(
        map((query) => {
          return [
            {
              label: `${query}`,
              execute: () => {
                const value = parseFloat(query);
                if (!isNaN(value)) {
                  ctx.mutator.replaceWithNumberExpr(expr, value);
                } else if (query === "+") {
                  ctx.mutator.replaceWithCallExpr(expr);
                }
              },
            },
          ];
        })
      );
    },
  };
}
