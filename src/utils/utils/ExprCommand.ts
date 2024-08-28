import assert from "assert-ts";
import { firstValueFrom, switchMap } from "rxjs";
import {
  ComponentKind,
  type CustomComponent,
  type CustomComponentParameter,
} from "src/ex-object/Component";
import type { ExFuncParameter } from "src/ex-object/ExFunc";
import { ExItemFn, ExItemType, type Expr } from "src/ex-object/ExItem";
import type { ExObject } from "src/ex-object/ExObject";
import {
  createComponentParameterReferenceExpr,
  createExFuncParameterReferenceExpr,
  createPropertyReferenceExpr,
  createReferenceExpr,
  ReferenceExpr2,
} from "src/ex-object/Expr";
import { PropertyFns, type Property } from "src/ex-object/Property";
import type MainContext from "src/main-context/MainContext";
import { log5 } from "src/utils/utils/Log3";
import type { OBS } from "src/utils/utils/Utils";
import { match } from "variant";

const log55 = log5("ExprCommand.ts");

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

    for await (const command of getExprCommands2(ctx, expr)) {
      commands.push(command);
    }
  }
}

async function* getExprCommands2(
  ctx: MainContext,
  exItem: Expr
): AsyncGenerator<ExprCommand, void, undefined> {
  for await (const ancestor of ExItemFn.getAncestors(exItem)) {
    log55.debug("ancestor", ancestor.id);
    const createReferenceExprCommand_ = (reference2: ReferenceExpr2) => createReferenceExprCommand(ctx, exItem, reference2, ancestor as any);

    switch (ancestor.itemType) {
      case ExItemType.ExObject:
        createReferenceExprCommand_(ReferenceExpr2.Property({ property: ancestor.cloneCountProperty }));

        for (const property of ancestor.componentParameterProperties) {
          createReferenceExprCommand_(ReferenceExpr2.Property({ property }));
        }

        for (const property of await firstValueFrom(
          ancestor.basicProperties$
        )) {
          createReferenceExprCommand_(ReferenceExpr2.Property({ property }));
        }

        break;
      case ExItemType.Component:
        assert(ancestor.componentKind === ComponentKind.CustomComponent);

        for (const parameter of await firstValueFrom(ancestor.parameters$)) {
          createReferenceExprCommand_(ReferenceExpr2.ComponentParameter({ parameter }));
        }

        for (const property of await firstValueFrom(ancestor.properties$)) {
          createReferenceExprCommand_(ReferenceExpr2.Property({ property }));
        }
        break;
      case ExItemType.ExFunc:
        for (const parameter of await firstValueFrom(ancestor.exFuncParameterArr$)) {
          createReferenceExprCommand_(ReferenceExpr2.ExFuncParameter({ parameter }));
        }
        break;
    }
  }
}

async function createReferenceExprCommand(
  ctx: MainContext,
  expr: Expr,
  reference2: ReferenceExpr2,
  parent: ExObject | CustomComponent
): Promise<ExprCommand> {
  const name = match(reference2, {
    Property: async ({ property }) => {
      return await firstValueFrom(PropertyFns.getName$(property));
    },
    ComponentParameter: async ({ parameter }) => {
      return await firstValueFrom(parameter.name$);
    },
    ExFuncParameter: async ({ parameter }) => {
      return await firstValueFrom(parameter.name$);
    },
  });

  const parentName = await firstValueFrom(parent.name$);
  const label = `${parentName}.${name}`;
  return {
    label,
    execute: async () => {
      const referenceExpr = await createReferenceExpr(ctx, {
        parent,
        reference: reference2,
      });
      ctx.mutator.replaceExpr(expr, referenceExpr);
    },
  };
}
