import assert from "assert-ts";
import { Effect } from "effect";
import { firstValueFrom, switchMap } from "rxjs";
import {
  Component,
  ComponentFactory,
  type ComponentKind,
} from "src/ex-object/Component";
import { CustomExFuncFactory, SystemExFuncFactory } from "src/ex-object/ExFunc";
import { ExItem } from "src/ex-object/ExItem";
import { ExObject, ExObjectFactory } from "src/ex-object/ExObject";
import { Expr, ExprFactory2, ExprParentFactory, type ExprKind } from "src/ex-object/Expr";
import { DexRuntime } from "src/utils/utils/DexRuntime";
import { log5 } from "src/utils/utils/Log5";
import type { OBS } from "src/utils/utils/Utils";
import { isOfVariant, isType } from "variant";

const log55 = log5("ExprCommand.ts");

export interface ExprCommand {
  label: string;
  execute: () => void;
}

export class ExprCommandCtx extends Effect.Tag("ExprCommandCtx")<
  ExprCommandCtx,
  Effect.Effect.Success<typeof ctxEffect>
>() {}

const ctxEffect = Effect.gen(function* () {
  return {
    getReplacementCommands$(expr: Expr, query$: OBS<string>) {
      return query$.pipe(
        switchMap((query) => {
          return getCommands(query, expr);
        })
      );
    },

    getCommands(query: string, expr: Expr) {
      return Effect.gen(function* () {
        const commands: ExprCommand[] = [];
        const value = parseFloat(query);
        if (!isNaN(value)) {
          commands.push({
            label: `${value}`,
            execute: () => {
              return Effect.gen(function* () {
                const numberExpr = yield* ExprFactory2.Number({ value });
                yield* Expr.replaceExpr(expr, numberExpr);
              });
            },
          });
        }

        if (query === "+") {
          commands.push({
            label: "+",
            execute: () => {
              return Effect.gen(function* () {
                const systemExFunc = SystemExFuncFactory.Add();
                const callExpr = yield* ExprFactory2.Call({
                  exFunc: systemExFunc,
                });
                yield* Expr.replaceExpr(expr, callExpr);
              });
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
      });
    },
  };
});

async function* getExprCommands2(exItem: Expr) {
  for await (const ancestor of ExItem.getAncestors(exItem)) {
    log55.debug("ancestor", ancestor.id);
    const createReferenceExprCommand_ = (reference2: ExprKind["Reference"]) =>
      createReferenceExprCommand(exItem, reference2, ancestor as any);

    if (isType(ancestor, ExObjectFactory)) {
      yield createReferenceExprCommand_(
        yield* ExprFactory2.Reference({
          target: ancestor.cloneCountProperty,
        })
      );

      for (const property of ancestor.componentParameterProperties) {
        const reference = await DexRuntime.runPromise(
          ExprFactory2.Reference({ target: property })
        );
        yield createReferenceExprCommand_(reference);
      }

      for (const property of await firstValueFrom(ancestor.basicProperties$)) {
        const reference = await DexRuntime.runPromise(
          ExprFactory2.Reference({ target: property })
        );
        yield createReferenceExprCommand_(reference);
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

/**
 * @returns Generator of Effect. Not an Effect.
 */
function* getReferences(ancestor: ExItem) {
  if (isType(ancestor, ExObjectFactory)) {
    const properties = ExObject.Methods(ancestor).properties;
    for (const property of properties) {
      yield* ExprFactory2.Reference({ target: property });
    }
  } else if (isType(ancestor, ComponentFactory.Custom)) {
    for (const parameter of ancestor.parameters.items) {
      yield* ExprFactory2.Reference({ target: parameter });
    }

    for (const property of ancestor.properties.items) {
      yield* ExprFactory2.Reference({ target: property });
    }
  } else if (isType(ancestor, CustomExFuncFactory)) {
    for (const parameter of ancestor.parameters.items) {
      yield* ExprFactory2.Reference({ target: parameter });
    }
  }
}

function* createReferenceExprCommands(
  currentExpr: Expr,
  referenceExprs: Iterable<ExprKind["Reference"]>
) {
  for (const referenceExpr of referenceExprs) {
    yield createReferenceExprCommand(currentExpr, referenceExpr);
  }
}

async function createReferenceExprCommand(
  currentExpr: Expr,
  newExpr: ExprKind["Reference"]
): Promise<ExprCommand> {
  const parent = await firstValueFrom(currentExpr.parent$);
  assert(isOfVariant(parent, ExprParentFactory));

  parent

  const target = newExpr.target;
  assert(target !== null);
  const name = await firstValueFrom(Expr.getReferenceTargetName$(target));

  const parentName = await firstValueFrom(parent.name$);
  const label = `${parentName}.${name}`;
  return {
    label,
    execute() {
      return Effect.gen(function* () {
        yield* Expr.replaceExpr(currentExpr, newExpr);
      });
    },
  };
}
