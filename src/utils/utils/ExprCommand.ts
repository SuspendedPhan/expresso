import assert from "assert-ts";
import { firstValueFrom, switchMap } from "rxjs";
import { ComponentKind, type CustomComponent, type CustomComponentParameter } from "src/ex-object/Component";
import type { ExFuncParameter } from "src/ex-object/ExFunc";
import {
  ExItemFn,
  ExItemType,
  type Expr
} from "src/ex-object/ExItem";
import type { ExObject } from "src/ex-object/ExObject";
import { createComponentParameterReferenceExpr, createExFuncParameterReferenceExpr, createPropertyReferenceExpr } from "src/ex-object/Expr";
import { PropertyFns, type Property } from "src/ex-object/Property";
import type MainContext from "src/main-context/MainContext";
import { log5 } from "src/utils/utils/Log3";
import type { OBS } from "src/utils/utils/Utils";

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

    switch (ancestor.itemType) {
      case ExItemType.ExObject:
        yield createPropertyCommand(ctx, exItem, ancestor.cloneCountProperty, ancestor);
        
        for (const property of ancestor.componentParameterProperties) {
          yield createPropertyCommand(ctx, exItem, property, ancestor);
        }

        for (const property of await firstValueFrom(
          ancestor.basicProperties$
        )) {
          yield createPropertyCommand(ctx, exItem, property, ancestor);
        }

        break;
      case ExItemType.Component:
        assert(ancestor.componentKind === ComponentKind.CustomComponent);

        for (const parameter of await firstValueFrom(ancestor.parameters$)) {
          yield createComponentParameterCommand(ctx, exItem, parameter, ancestor);
        }

        for (const property of await firstValueFrom(ancestor.properties$)) {
          yield createPropertyCommand(ctx, exItem, property, ancestor);
        }
        break;
    }
  }
}


async function createPropertyCommand(ctx: MainContext, expr: Expr, property: Property, parent: ExObject | CustomComponent): Promise<ExprCommand> {
  const name = await firstValueFrom(PropertyFns.getName$(property));
  const parentName = await firstValueFrom(parent.name$);
  const label = `${parentName}.${name}`;
  return {
    label,
    execute: async () => {
      const propertyReferenceExpr = await createPropertyReferenceExpr({
        ctx,
        property,
      });
      ctx.mutator.replaceExpr(expr, propertyReferenceExpr);
    },
  };
}

async function createComponentParameterCommand(ctx: MainContext, expr: Expr, parameter: CustomComponentParameter, parent: ExObject | CustomComponent): Promise<ExprCommand> {
  const name = await firstValueFrom(parameter.name$);
  const parentName = await firstValueFrom(parent.name$);
  const label = `${parentName}.${name}`;
  return {
    label,
    execute: async () => {
      const parameterReferenceExpr = await createComponentParameterReferenceExpr({
        ctx,
        parameter,
      });
      ctx.mutator.replaceExpr(expr, parameterReferenceExpr);
    },
  };
}

async function createExFuncParameterCommand(ctx: MainContext, expr: Expr, parameter: ExFuncParameter, parent: ExObject | CustomComponent): Promise<ExprCommand> {
  const name = await firstValueFrom(parameter.name$);
  const parentName = await firstValueFrom(parent.name$);
  const label = `${parentName}.${name}`;
  return {
    label,
    execute: async () => {
      const parameterReferenceExpr = await createExFuncParameterReferenceExpr({
        ctx,
        parameter,
      });
      ctx.mutator.replaceExpr(expr, parameterReferenceExpr);
    },
  };
}