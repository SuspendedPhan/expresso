import assert from "assert-ts";
import { Effect, Layer, Ref, Stream, SubscriptionRef } from "effect";
import { Observable, Subject, switchMap } from "rxjs";
import { ComponentFactory } from "src/ex-object/Component";
import { CustomExFuncFactory, SystemExFuncFactory } from "src/ex-object/ExFunc";
import { ExItem } from "src/ex-object/ExItem";
import { ExObject, ExObjectFactory } from "src/ex-object/ExObject";
import { Expr, ExprFactory2 } from "src/ex-object/Expr";
import { ExprFocusFactory } from "src/focus/ExprFocus";
import { FocusCtx } from "src/focus/FocusCtx";
import { DexRuntime } from "src/utils/utils/DexRuntime";
import { EffectUtils } from "src/utils/utils/EffectUtils";
import { log5 } from "src/utils/utils/Log5";
import { type OBS } from "src/utils/utils/Utils";
import { isType } from "variant";
import { ComboboxCtx } from "../views/Combobox";

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

  return {
    createComboboxPropsIn(expr: Expr) {
      return Effect.gen(this, function* () {
        const comboboxCtx = yield* ComboboxCtx;
        const focusCtx = yield* FocusCtx;

        const query = yield* SubscriptionRef.make("");

        const filteredOptions = query.changes.pipe(
          Stream.mapEffect((query) => this.getCommands(query, expr))
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

        // yield* EffectUtils.obsToStream(this.onSubmitExprCommand$).pipe(
        //   Stream.runForEach(() => {
        //     return Effect.gen(function* () {
        //       console.log("onSubmitExprCommand$");
        //       const option = yield* props.propsOut.focusedOption.pipe(
        //         EffectUtils.getFirstOrThrow
        //       );
        //       if (Option.isNone(option)) {
        //         return;
        //       }
        
        //       yield* option.value.execute();
        //     });
        //   }),
        //   Effect.forkIn(expr.scope)
        // );

        return props.propsIn;
      });
    },

    onSubmitExprCommand$: new Subject<void>(),

    getReplacementCommands$(
      expr: Expr,
      query$: OBS<string>
    ): Observable<ExprSelectOption[]> {
      return query$.pipe(
        switchMap(async (query) => {
          const commands = this.getCommands(query, expr);
          return DexRuntime.runPromise(commands);
        })
      );
    },

    getCommands(query: string, expr: Expr) {
      return Effect.gen(function* () {
        log55.debug("getCommands.start", { query, expr });

        const commands: ExprSelectOption[] = [];
        const value = parseFloat(query);
        if (!isNaN(value)) {
          const numberExpr = yield* ExprFactory2.Number({ value });
          const command = createCommand(value.toString(), expr, numberExpr);
          commands.push(command);
        }

        if (query === "+") {
          commands.push({
            label: "+",
            execute: () => {
              const effect = Effect.gen(function* () {
                const systemExFunc = SystemExFuncFactory.Add();
                const callExpr = yield* ExprFactory2.Call({
                  exFunc: systemExFunc,
                });
                yield* Expr.replaceExpr(expr, callExpr);
              });
              return effect;
            },
          });
        }

        const exprCommands = getExprCommands(expr);
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
  async function* getExprCommands(currentExpr: Expr) {
    for await (const ancestor of ExItem.getAncestors(currentExpr)) {
      yield* getExprCommands2(currentExpr, ancestor);
    }
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

        const targetParent = yield* EffectUtils.firstValueFrom(target.parent$);
        let label;
        log55.debug(
          "Creating ExprReference command: Getting parent name for label",
          targetParent
        );
        if (isType(targetParent, ExObjectFactory)) {
          const parentName = yield* EffectUtils.firstValueFrom(
            targetParent.name$
          );
          label = `${parentName}.${name}`;
        } else {
          label = name;
        }

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
