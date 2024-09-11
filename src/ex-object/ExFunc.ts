import { Effect } from "effect";
import { of } from "rxjs";
import { ProjectCtx } from "src/ctx/ProjectCtx";
import {
  ExFuncParameterFactory2,
  type ExFuncParameter,
} from "src/ex-object/ExFuncParameter";
import { ExItem, type ExItemBase } from "src/ex-object/ExItem";
import { ExprFactory2, type Expr } from "src/ex-object/Expr";
import { Project } from "src/ex-object/Project";
import {
  createObservableArrayWithLifetime,
  type ObservableArray,
} from "src/utils/utils/ObservableArray";
import {
  createBehaviorSubjectWithLifetime,
  Utils,
  type BSUB,
} from "src/utils/utils/Utils";
import {
  dexScopedVariant,
  type DexVariantKind,
} from "src/utils/utils/VariantUtils4";
import { fields, isType, matcher, variation, type VariantOf } from "variant";

export type ExFunc = CustomExFunc | SystemExFunc;

type CustomExFunc_ = ExItemBase & {
  id: string;
  name$: BSUB<string>;
  expr$: BSUB<Expr>;
  parameters: ObservableArray<ExFuncParameter>;
};

type CustomExFunc2_ = CustomExFunc_ & ReturnType<typeof methodsFactory>;

export const SystemExFuncFactory = dexScopedVariant("ExFunc/System", {
  Add: () => ({ name: "Add" }),
});

export type SystemExFunc = VariantOf<typeof SystemExFuncFactory>;
export type SystemExFuncKind = DexVariantKind<typeof SystemExFuncFactory>;

export const CustomExFuncFactory = variation(
  "ExFunc/Custom",
  fields<CustomExFunc2_>()
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
      const projectCtx = yield* ProjectCtx;
      let name = creationArgs.name;
      if (name === undefined) {
        const project: Project = yield* projectCtx.activeProject;
        const ordinal = Project.Methods(project).getAndIncrementOrdinal();
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
      const customExFunc2_: CustomExFunc2_ = {
        ...customExFunc_,
        ...methodsFactory(customExFunc_),
      };
      return CustomExFuncFactory(customExFunc2_);
    });
  },
};

export const ExFunc = {
  name$(exFunc: ExFunc) {
    if (isType(exFunc, CustomExFuncFactory)) {
      return exFunc.name$;
    }
    return of(exFunc.name);
  },
};

function methodsFactory(exFunc: CustomExFunc_) {
  return {
    addParameterBlank() {
      return Effect.gen(function* () {
        const param = yield* ExFuncParameterFactory2({});
        exFunc.parameters.push(param);
        return param;
      });
    },
  };
}
