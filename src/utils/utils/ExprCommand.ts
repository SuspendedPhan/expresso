import { firstValueFrom, switchMap } from "rxjs";
import type { Expr } from "src/ex-object/ExItem";
import { createPropertyReferenceExpr } from "src/ex-object/Expr";
import { PropertyFns } from "src/ex-object/Property";
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
        switchMap((query) => {
          return getCommands(query, expr);
        })
      );
    },
  };

  async function getCommands(
    query: string,
    expr: Expr
  ): Promise<ExprCommand[]> {
    const commands: ExprCommand[] = [];
    const value = parseFloat(query);
    if (!isNaN(value)) {
      commands.push({
        label: `${value}`,
        execute: () => {
          ctx.mutator.replaceWithNumberExpr(expr, value);
        },
      });
    }

    if (query === "+") {
      commands.push({
        label: "+",
        execute: () => {
          ctx.mutator.replaceWithCallExpr(expr);
        },
      });
    }

    const propertyGen = PropertyFns.getAncestorPropertyGen(expr);
    for await (const [property, parent] of propertyGen) {
      const name = await firstValueFrom(PropertyFns.getName$(property));
      const parentName = await firstValueFrom(parent.name$);
      const label = `${parentName}.${name}`;
      commands.push({
        label,
        execute: async () => {
          const propertyReferenceExpr = await createPropertyReferenceExpr({
            ctx,
            property,
          });
          ctx.mutator.replaceExpr(expr, propertyReferenceExpr);
        },
      });
    };
    return commands;
  }
}
