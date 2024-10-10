// File: ExFunc.ts

import { Effect, Stream } from "effect";
import { of } from "rxjs";
import {
  ExFuncParameterFactory2,
  type ExFuncParameter,
} from "src/ex-object/ExFuncParameter";
import { ExItem, type ExItemBase } from "src/ex-object/ExItem";
import { ExprFactory2, type Expr } from "src/ex-object/Expr";
import { Project } from "src/ex-object/Project";
import { EffectUtils } from "src/utils/utils/EffectUtils";
import { log5 } from "src/utils/utils/Log5";
import {
  createObservableArrayWithLifetime,
  type ObservableArray,
} from "src/utils/utils/ObservableArray";
import {
  createBehaviorSubjectWithLifetime,
  Utils,
  type BSUB,
} from "src/utils/utils/Utils";
import { fields, isType, variation } from "variant";

const log55 = log5("ExFunc.ts");

export type ExFunc = CustomExFunc | SystemExFunc;

type CustomExFunc_ = ExItemBase & {
  id: string;
  name$: BSUB<string>;
  expr$: BSUB<Expr>;
  parameters: ObservableArray<ExFuncParameter>;
};

interface SystemExFunc_ {
  id: string;
  shortLabel: string;
  parameterCount: number;
}

export const SystemExFuncFactory = variation(
  "ExFunc.System",
  fields<SystemExFunc_>()
);

export type SystemExFunc = ReturnType<typeof SystemExFuncFactory>;

export const CustomExFuncFactory = variation(
  "ExFunc.Custom",
  fields<CustomExFunc_>()
);
export type CustomExFunc = ReturnType<typeof CustomExFuncFactory>;

interface CustomExFuncCreationArgs {
  id?: string;
  name?: string;
  expr?: Expr;
  exFuncParameterArr?: ExFuncParameter[];
}

export const CustomExFuncFactory2 = {
  Custom(creationArgs: CustomExFuncCreationArgs) {
    return Effect.gen(function* () {
      let name = creationArgs.name;
      if (name === undefined) {
        const project: Project = yield* Project.activeProject;
        const ordinal = yield* Project.Methods(
          project
        ).getAndIncrementOrdinal();
        name = `Function ${ordinal}`;
      }

      const creationArgs2: Required<CustomExFuncCreationArgs> = {
        id: creationArgs.id ?? Utils.createId("ex-func"),
        name: creationArgs.name ?? `Function ${Utils.createId("ex-func")}`,
        expr:
          creationArgs.expr === undefined
            ? yield* ExprFactory2.Number({})
            : creationArgs.expr,
        exFuncParameterArr: creationArgs.exFuncParameterArr ?? [],
      };

      const base: ExItemBase = yield* ExItem.createExItemBase(creationArgs2.id);
      const customExFunc_ = {
        ...base,
        name$: createBehaviorSubjectWithLifetime(base.destroy$, name),
        expr$: createBehaviorSubjectWithLifetime(
          base.destroy$,
          creationArgs2.expr
        ),
        parameters: createObservableArrayWithLifetime(
          base.destroy$,
          creationArgs2.exFuncParameterArr
        ),
      };

      log55.debug("CustomExFuncFactory2.Custom", customExFunc_);
      const exFunc = CustomExFuncFactory(customExFunc_);
      creationArgs2.expr.parent$.next(exFunc);
      return exFunc;
    });
  },
};

export const ExFunc = {
  name$(exFunc: ExFunc) {
    if (isType(exFunc, CustomExFuncFactory)) {
      return exFunc.name$;
    }
    return of(exFunc.id);
  },

  addParameterBlank(exFunc: CustomExFunc) {
    return Effect.gen(function* () {
      console.log("addParameterBlank");
      const param = yield* ExFuncParameterFactory2({});
      yield* exFunc.parameters.push(param);

      console.log("addParameterBlank2");

      const project = yield* ExItem.getProject3(exFunc).pipe(
        Stream.unwrap,
        EffectUtils.getFirstOrThrow,
        Effect.timeout(1000)
      );

      console.log("addParameterBlank3");

      for (const expr of project.exprs.items) {
        console.log("addParameterBlank4");
        if (expr.type !== "Expr/Call") continue;

        console.log("addParameterBlank5");
        const arg = yield* ExprFactory2.Number({ value: 0 });
        arg.parent$.next(expr);
        yield* expr.args.push(arg);
      }

      return param;
    });
  },
};
