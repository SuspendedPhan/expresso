// File: Expr.ts

import assert from "assert-ts";
import { Effect, Scope, Stream } from "effect";
import { of } from "rxjs";
import { CloneNumberTargetFactory, type CloneNumberTarget } from "src/ex-object/CloneNumberTarget";
import {
  ComponentParameterFactory,
  type ComponentParameterKind,
} from "src/ex-object/ComponentParameter";
import {
  CustomExFuncFactory,
  SystemExFuncFactory,
  type ExFunc,
} from "src/ex-object/ExFunc";
import {
  ExFuncParameterFactory,
  type ExFuncParameter,
} from "src/ex-object/ExFuncParameter";
import { ExItem, type ExItemBase } from "src/ex-object/ExItem";
import { Property, PropertyFactory } from "src/ex-object/Property";
import { EffectUtils } from "src/utils/utils/EffectUtils";
import { log5 } from "src/utils/utils/Log5";
import {
  createObservableArrayWithLifetime,
  type ArrayEvent,
  type ObservableArray,
} from "src/utils/utils/ObservableArray";
import {
  createBehaviorSubjectWithLifetime,
  Utils,
  type BSUB,
  type OBS,
} from "src/utils/utils/Utils";
import {
  dexScopedVariant,
  type DexVariantKind,
} from "src/utils/utils/VariantUtils4";
import { fields, isOfVariant, isType, type VariantOf } from "variant";

const log55 = log5("Expr.ts");

export interface ExprReplacement {
  oldExpr: Expr;
  newExpr: Expr;
}

export type ReferenceTarget =
  | Property
  | ComponentParameterKind["Custom"]
  | ExFuncParameter
  | CloneNumberTarget;

interface CallExpr_ extends ExItemBase {
  args$: OBS<Expr[]>;
  args: ObservableArray<Expr>;
  exFunc$: BSUB<ExFunc | null>;
}

export const ExprFactory = dexScopedVariant("Expr", {
  Number: fields<{ value: number } & ExItemBase>(),
  Reference: fields<{ target: ReferenceTarget | null } & ExItemBase>(),
  Call: fields<CallExpr_>(),
});

export type Expr = VariantOf<typeof ExprFactory>;
export type ExprKind = DexVariantKind<typeof ExprFactory>;

interface ExprCreationArgs {
  Number: {
    id?: string;
    value?: number;
  };

  Reference: {
    id?: string;
    target: ReferenceTarget | null;
  };

  CallExpr: {
    id?: string;
    exFunc?: ExFunc | null;
    args?: Expr[];
  };
}

export const ExprFactory2 = {
  Number(creationArgs: ExprCreationArgs["Number"]) {
    return Effect.gen(function* () {
      const creationArgs2: Required<ExprCreationArgs["Number"]> = {
        id: creationArgs.id ?? Utils.createId("expr"),
        value: creationArgs.value ?? 0,
      };

      const base = yield* ExItem.createExItemBase(creationArgs2.id);
      const expr = ExprFactory.Number({
        ...base,
        value: creationArgs2.value,
      });
      yield* addToProject(expr);
      return expr;
    });
  },

  Reference(creationArgs: ExprCreationArgs["Reference"]) {
    return Effect.gen(function* () {
      const creationArgs2: Required<ExprCreationArgs["Reference"]> = {
        id: creationArgs.id ?? Utils.createId("expr"),
        target: creationArgs.target,
      };

      const base = yield* ExItem.createExItemBase(creationArgs2.id);
      const expr = ExprFactory.Reference({
        ...base,
        target: creationArgs2.target,
      });
      yield* addToProject(expr);
      return expr;
    });
  },

  Call: (creationArgs: ExprCreationArgs["CallExpr"]) => {
    return Effect.gen(function* () {
      const creationArgs2: Required<ExprCreationArgs["CallExpr"]> = {
        id: creationArgs.id ?? Utils.createId("call-expr"),
        args: creationArgs.args ?? [],
        exFunc: creationArgs.exFunc ?? null,
      };

      const { exFunc } = creationArgs2;
      const isExFunc = isOfVariant(exFunc, SystemExFuncFactory);
      const argsEmpty = creationArgs2.args.length === 0;
      const makeArgs = argsEmpty && isExFunc;
      if (makeArgs) {
        for (let index = 0; index < exFunc.parameterCount; index++) {
          const arg = yield* ExprFactory2.Number({ value: 0 });
          creationArgs2.args.push(arg);
        }
      }

      const base = yield* ExItem.createExItemBase(creationArgs2.id);
      const args = createObservableArrayWithLifetime(
        base.destroy$,
        creationArgs2.args
      );
      const expr = ExprFactory.Call({
        ...base,
        args$: args.items$,
        args,
        exFunc$: createBehaviorSubjectWithLifetime(base.destroy$, exFunc),
      });

      for (const arg of creationArgs2.args) {
        arg.parent$.next(expr);
      }

      yield* addToProject(expr);
      return expr;
    });
  },
};

export const Expr = {
  descendants(expr: Expr): Effect.Effect<Expr[]> {
    return Effect.gen(function* () {
      log55.debug("descendants: expr", expr);
      if (!isType(expr, ExprFactory.Call)) {
        return [];
      }

      const result: Expr[] = [];
      for (const child of expr.args.items) {
        result.push(child);
        const descendantsForChild = yield* Expr.descendants(child);
        result.push(...descendantsForChild);
      }
      return result;
    });
  },

  descendants2(expr: Expr): Effect.Effect<Stream.Stream<ArrayEvent<Expr>>> {
    return Effect.gen(function* () {
      log55.debug("descendants2: expr", expr);
      if (!isType(expr, ExprFactory.Call)) {
        return Stream.make();
      }

      const childEvents = Stream.unwrap(expr.args.events).pipe(
        Stream.tap((evt) => {
          return Effect.gen(function* () {
            log55.debug("descendants2: childEvents", evt);
          });
        })
      );

      const descendantsForChildren = Stream.flatMap(
        expr.args.itemStream,
        (children: Expr[]) => {
          log55.debug("descendants2: children", children);
          return Expr.descendants3(children);
        },
        { switch: true }
      );

      const result: Stream.Stream<ArrayEvent<Expr>> = Stream.merge(
        childEvents,
        descendantsForChildren
      );
      return result;
    });
  },

  descendants3(exprs: Expr[]) {
    const vv = exprs.map((vv2) => Stream.unwrap(Expr.descendants2(vv2)));
    return Stream.mergeAll(vv, { concurrency: "unbounded" });
  },

  getReferenceTargetName$(target: ReferenceTarget) {
    if (isOfVariant(target, PropertyFactory)) {
      return Property.Methods(target).getName$();
    }

    if (isType(target, ComponentParameterFactory.Custom)) {
      return target.name$;
    }

    if (isType(target, ExFuncParameterFactory)) {
      return target.name$;
    }

    if (isType(target, CloneNumberTargetFactory)) {
      return of("Clone Number");
    }

    throw new Error("Unknown target type");
  },

  getProperty(expr: Expr) {
    return Effect.gen(function* () {
      let parent = yield* EffectUtils.firstValueFrom(expr.parent$);
      while (parent) {
        if (isOfVariant(parent, PropertyFactory)) {
          return parent;
        }
        parent = yield* EffectUtils.firstValueFrom(parent.parent$);
      }
      throw new Error("Property not found");
    });
  },

  replaceExpr(oldExpr: Expr, newExpr: Expr) {
    return Effect.gen(function* () {
      log55.debug("replaceExpr", oldExpr, newExpr);
      const parent = yield* EffectUtils.firstValueFrom(oldExpr.parent$);
      if (!parent) {
        throw new Error("oldExpr.parent$ is null");
      }

      if (isOfVariant(parent, PropertyFactory)) {
        parent.expr$.next(newExpr);
      } else if (isOfVariant(parent, ExprFactory)) {
        assert(isType(parent, ExprFactory.Call));
        yield* parent.args.replaceItem(oldExpr, newExpr);
      } else if (isType(parent, CustomExFuncFactory)) {
        parent.expr$.next(newExpr);
      } else {
        throw new Error("Unexpected itemType");
      }

      newExpr.parent$.next(parent);
    });
  },
};

function addToProject(expr: Expr): Effect.Effect<void, never, never> {
  return Effect.gen(function* () {
    yield* ExItem.getProject3(expr).pipe(
      Stream.unwrap,
      Stream.take(1),
      Stream.runForEach((project) => {
        return Effect.gen(function* () {
          log55.debug("Pushing expr to project");
          console.log("Pushing expr to project", expr.id);
          yield* project.exprs.push(expr);

          yield* Scope.addFinalizer(
            expr.scope,
            Effect.gen(function* () {
              yield* project.exprs.remove(expr);
            })
          );
        });
      }),
      Effect.forkIn(expr.scope)
    );
  });
}