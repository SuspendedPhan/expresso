import { Effect } from "effect";
import {
  type ExFunc
} from "src/ex-object/ExFunc";
import { ExItem, type ExItemBase } from "src/ex-object/ExItem";
import type { Expr } from "src/ex-object/Expr";
import {
  createBehaviorSubjectWithLifetime,
  Utils,
  type SUB,
} from "src/utils/utils/Utils";
import { fields, variation } from "variant";

interface CallExpr_ extends ExItemBase {
  args$: SUB<Expr[]>;
  exFunc$: SUB<ExFunc>;
}

export const CallExprFactory = variation("CallExpr", fields<CallExpr_>());
export type CallExpr = ReturnType<typeof CallExprFactory>;

interface CallExprCreationArgs {
  id?: string;
  exFunc: ExFunc;
  args?: Expr[];
}

export function CallExprFactory2(creationArgs: CallExprCreationArgs) {
  return Effect.gen(function* () {
    const creationArgs2: Required<CallExprCreationArgs> = {
      id: creationArgs.id ?? Utils.createId("call-expr"),
      args: creationArgs.args ?? [],
      exFunc: creationArgs.exFunc,
    };

    const base = yield* ExItem.createExItemBase(creationArgs2.id);
    const expr = CallExprFactory({
      ...base,
      args$: createBehaviorSubjectWithLifetime(
        base.destroy$,
        creationArgs2.args
      ),
      exFunc$: createBehaviorSubjectWithLifetime(
        base.destroy$,
        creationArgs2.exFunc
      ),
    });

    for (const arg of creationArgs2.args) {
      arg.parent$.next(expr);
    }

    return expr;
  });
}
