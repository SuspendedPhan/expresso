import assert from "assert-ts";
import { firstValueFrom, switchMap } from "rxjs";
import { ComponentFactory, type ComponentKind } from "src/ex-object/Component";
import { ExFuncFactory } from "src/ex-object/ExFunc";
import { ExItemFn } from "src/ex-object/ExItem";
import { ExObjectFactory, type ExObject } from "src/ex-object/ExObject";
import { Expr, ExprFactory2, type ExprKind } from "src/ex-object/Expr";
import type MainContext from "src/main-context/MainContext";
import { log5 } from "src/utils/utils/Log5";
import type { OBS } from "src/utils/utils/Utils";
import { isType } from "variant";

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
      const blank = query === "";
      const includes = command.label.includes(query);
      if (blank || includes) {
        commands.push(command);
      }
    }

    return commands;
  }
}

async function* getExprCommands2(
  ctx: MainContext,
  exItem: Expr
): AsyncGenerator<ExprCommand, void, undefined> {
  for await (const ancestor of ExItemFn.getAncestors(exItem)) {
    log55.debug("ancestor", ancestor.id);
    const createReferenceExprCommand_ = (reference2: ExprKind["Reference"]) =>
      createReferenceExprCommand(ctx, exItem, reference2, ancestor as any);

    if (isType(ancestor, ExObjectFactory.Basic)) {
      yield createReferenceExprCommand_(
        await ExprFactory2.Reference(ctx, { target: ancestor.cloneCountProperty })
      );

      for (const property of ancestor.componentParameterProperties) {
        yield createReferenceExprCommand_(
          await ExprFactory2.Reference(ctx, { target: property })
        );
      }

      for (const property of await firstValueFrom(ancestor.basicProperties$)) {
        yield createReferenceExprCommand_(
          await ExprFactory2.Reference(ctx, { target: property })
        );
      }
    } else if (isType(ancestor, ComponentFactory.Custom)) {
      for (const parameter of await firstValueFrom(ancestor.parameters$)) {
        yield createReferenceExprCommand_(
          await ExprFactory2.Reference(ctx, { target: parameter })
        );
      }

      for (const property of await firstValueFrom(ancestor.properties$)) {
        yield createReferenceExprCommand_(
          await ExprFactory2.Reference(ctx, { target: property })
        );
      }
    } else if (isType(ancestor, ExFuncFactory.Custom)) {
      for (const parameter of await firstValueFrom(
        ancestor.exFuncParameterArr$
      )) {
        log55.debug("parameter", parameter.id);
        yield createReferenceExprCommand_(
          await ExprFactory2.Reference(ctx, { target: parameter })
        );
      }
    }
  }
}

async function createReferenceExprCommand(
  ctx: MainContext,
  currentExpr: Expr,
  newExpr: ExprKind["Reference"],
  parent: ExObject | ComponentKind["Custom"]
): Promise<ExprCommand> {
  const target = newExpr.target;
  assert(target !== null);
  const name = await firstValueFrom(Expr.getReferenceTargetName$(target));

  const parentName = await firstValueFrom(parent.name$);
  const label = `${parentName}.${name}`;
  return {
    label,
    execute: async () => {
      ctx.mutator.replaceExpr(currentExpr, newExpr);
    },
  };
}
