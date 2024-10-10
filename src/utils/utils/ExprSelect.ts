import assert from "assert-ts";
import { Effect, Layer, Ref, Stream, SubscriptionRef } from "effect";
import { Subject } from "rxjs";
import { SystemExFuncCtx } from "src/ctx/SystemExFuncCtx";
import { ComponentFactory } from "src/ex-object/Component";
import { CustomExFuncFactory } from "src/ex-object/ExFunc";
import { ExItem } from "src/ex-object/ExItem";
import { ExObject, ExObjectFactory } from "src/ex-object/ExObject";
import { Expr, ExprFactory2 } from "src/ex-object/Expr";
import { Project } from "src/ex-object/Project";
import { ExprFocusFactory } from "src/focus/ExprFocus";
import { FocusCtx } from "src/focus/FocusCtx";
import { DexRuntime } from "src/utils/utils/DexRuntime";
import { EffectUtils } from "src/utils/utils/EffectUtils";
import { log5 } from "src/utils/utils/Log5";
import { isType } from "variant";
import { ComboboxCtx } from "../views/Combobox";
import { DexUtils } from "./DexUtils";
import { GlobalPropertyCtx } from "src/ex-object/GlobalProperty";

// @ts-ignore
const log55 = log5("ExprCommand.ts");

export interface ExprSelectOption {
  label: string;
  execute: () => Effect.Effect<void, never, never>;
}

export class ExprSelectCtx extends Effect.Tag("ExprCommandCtx")<
  ExprSelectCtx,
  Effect.Effect.Success<typeof ctxEffect>
>() {}

const ctxEffect = Effect.gen(function* () {
  const focusCtx = yield* FocusCtx;
  const systemExFuncCtx = yield* SystemExFuncCtx;
  const globalPropertyCtx = yield* GlobalPropertyCtx;

  return {
    createComboboxPropsIn(expr: Expr) {
      return Effect.gen(this, function* () {
        const comboboxCtx = yield* ComboboxCtx;
        const focusCtx = yield* FocusCtx;
        const project = yield* Project.activeProject;

        const query = yield* SubscriptionRef.make("");

        const filteredOptions = query.changes.pipe(
          Stream.mapEffect((query) => this.getCommands(query, expr, project))
        );

        const props = yield* comboboxCtx.createProps<ExprSelectOption>({
          options: filteredOptions,
        });

        yield* Effect.forkDaemon(
          Stream.runForEach(props.propsOut.onQueryChanged, (query_) => {
            return Effect.gen(function* () {
              yield* Ref.set(query, query_);
            });
          })
        );

        yield* Effect.forkDaemon(
          Stream.runForEach(props.propsOut.onOptionSelected, (value) => {
            return Effect.gen(function* () {
              yield* value.execute();
              focusCtx.popFocus();
            });
          })
        );

        return props.propsIn;
      });
    },

    onSubmitExprCommand$: new Subject<void>(),

    getCommands(query: string, expr: Expr, project: Project) {
      return Effect.gen(function* () {
        log55.debug("getCommands.start", { query, expr });

        const commands: ExprSelectOption[] = [];
        const value = parseFloat(query);
        if (!isNaN(value)) {
          const numberExpr = yield* ExprFactory2.Number({ value });
          const command = createCommand(value.toString(), expr, numberExpr);
          commands.push(command);
        }

        const exprCommands = getExprCommands(expr, project);
        yield* Effect.promise(async () => {
          for await (const command of exprCommands) {
            log55.debug("getCommands.command.start", command);
            const command2 = await DexRuntime.runPromise(command);
            const blank = query === "";
            const includes = command2.label.includes(query);
            if (blank || includes) {
              commands.push(command2);
            }
            log55.debug("getCommands.command.end", command);
          }
        });

        return commands;
      });
    },
  };

  /**
   * @returns Generator of Effect. Not an Effect.
   */
  async function* getExprCommands(currentExpr: Expr, project: Project) {
    for await (const ancestor of ExItem.getAncestors(currentExpr)) {
      yield* getExprCommands2(currentExpr, ancestor);
    }

    yield* getCustomExFuncCommands(project, currentExpr);
    yield* getGlobalPropertyCommands(currentExpr);
    yield* getSystemExFuncCommands(currentExpr);
  }

  function getCustomExFuncCommands(
    project: Project,
    currentExpr: Expr
  ): Effect.Effect<ExprSelectOption>[] {
    return project.exFuncs.items.map((exFunc) => {
      const extracted = {
        label: exFunc.name$.value,
        execute() {
          return Effect.gen(function* () {
            const callExpr = yield* ExprFactory2.Call({ exFunc });
            yield* Expr.replaceExpr(currentExpr, callExpr);
          });
        },
      };
      return Effect.succeed(extracted);
    });
  }

  function getSystemExFuncCommands(
    currentExpr: Expr
  ): Effect.Effect<ExprSelectOption>[] {
    return Object.values(systemExFuncCtx.systemExFuncs).map((systemExFunc) =>
      Effect.succeed({
        label: systemExFunc.shortLabel,
        execute() {
          return Effect.gen(function* () {
            const callExpr = yield* ExprFactory2.Call({
              exFunc: systemExFunc,
            });
            yield* Expr.replaceExpr(currentExpr, callExpr);
          });
        },
      } as ExprSelectOption)
    );
  }

  function getGlobalPropertyCommands(currentExpr: Expr): Effect.Effect<ExprSelectOption>[] {
    return globalPropertyCtx.globalProperties.map((globalProperty) => {
      return Effect.succeed({
        label: globalProperty.id,
        execute() {
          return Effect.gen(function* () {
            const globalPropertyExpr = yield* ExprFactory2.Reference({
              target: globalProperty,
            });
            yield* Expr.replaceExpr(currentExpr, globalPropertyExpr);
          });
        },
      } as ExprSelectOption);
    });
  }

  function* getExprCommands2(currentExpr: Expr, ancestor: ExItem) {
    const referenceExprs = getReferences();
    for (const referenceExpr of referenceExprs) {
      yield Effect.gen(function* () {
        const referenceExpr2 = yield* referenceExpr;
        const target = (yield* referenceExpr).target;
        assert(target !== null);
        const name = yield* EffectUtils.firstValueFrom(
          Expr.getReferenceTargetName$(target)
        );

        const getLabel = Effect.gen(function* () {
          if (DexUtils.hasTag(target)) {
            assert(target._tag === "GlobalProperty");
            return target.id;
          }

          const targetParent = yield* EffectUtils.firstValueFrom(
            target.parent$
          );

          if (isType(targetParent, ExObjectFactory)) {
            const parentName = yield* EffectUtils.firstValueFrom(
              targetParent.name$
            );
            return `${parentName}.${name}`;
          } else {
            return name;
          }
        });

        const label = yield* getLabel;

        return {
          label,
          execute() {
            return Effect.gen(function* () {
              yield* Expr.replaceExpr(currentExpr, referenceExpr2);
            });
          },
        };
      });
    }

    /**
     * @returns Generator of Effect. Not an Effect.
     */
    function* getReferences() {
      if (isType(ancestor, ExObjectFactory)) {
        const properties = ExObject.Methods(ancestor).properties;
        for (const property of properties) {
          yield ExprFactory2.Reference({ target: property });
        }

        yield ExprFactory2.Reference({
          target: ancestor.cloneNumberTarget,
        });
      } else if (isType(ancestor, ComponentFactory.Custom)) {
        for (const parameter of ancestor.parameters.items) {
          yield ExprFactory2.Reference({ target: parameter });
        }

        for (const property of ancestor.properties.items) {
          yield ExprFactory2.Reference({ target: property });
        }
      } else if (isType(ancestor, CustomExFuncFactory)) {
        for (const parameter of ancestor.parameters.items) {
          yield ExprFactory2.Reference({ target: parameter });
        }
      }
    }
  }

  function createCommand(
    label: string,
    oldExpr: Expr,
    newExpr: Expr
  ): ExprSelectOption {
    return {
      label,
      execute() {
        return Effect.gen(function* () {
          yield* Expr.replaceExpr(oldExpr, newExpr);
          focusCtx.setFocus(
            ExprFocusFactory.Expr({ expr: newExpr, isEditing: false })
          );
        });
      },
    };
  }
});

export const ExprCommandCtxLive = Layer.effect(ExprSelectCtx, ctxEffect);
