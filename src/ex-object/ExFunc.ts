import { Effect } from "effect";
import { LibraryCtx } from "src/ctx/LibraryCtx";
import {
  ExFuncParameterFactory2,
  type ExFuncParameter,
} from "src/ex-object/ExFuncParameter";
import { ExItem, type ExItemBase } from "src/ex-object/ExItem";
import { ExprFactory2, type Expr } from "src/ex-object/Expr";
import type { Project } from "src/ex-object/Project";
import {
  createObservableArrayWithLifetime,
  type ObservableArray,
} from "src/utils/utils/ObservableArray";
import {
  createBehaviorSubjectWithLifetime,
  Utils,
  type SUB,
} from "src/utils/utils/Utils";
import {
  dexScopedVariant,
  type DexVariantKind,
} from "src/utils/utils/VariantUtils4";
import { fields, variation, type VariantOf } from "variant";

export type ExFunc = CustomExFunc | SystemExFunc;

type CustomExFunc_ = ExItemBase & {
  id: string;
  name$: SUB<string>;
  expr$: SUB<Expr>;
  parameters: ObservableArray<ExFuncParameter>;
  // addParameterBlank(): Effect.Effect<ExFuncParameter>;
};

type CustomExFunc2_ = CustomExFunc_ & {
  addParameterBlank: typeof addParameterBlank;
};

export const SystemExFuncFactory = dexScopedVariant("ExFunc/System", {
  Add: {},
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
    return Effect.gen(eff.bind(null, creationArgs));
  },
};

function* eff(creationArgs: CustomExFuncCreationArgs) {
  const libraryCtx = yield* LibraryCtx;
  let name = creationArgs.name;
  if (name === undefined) {
    const project: Project = yield* libraryCtx.activeProject;
    const ordinal = project.getAndIncrementOrdinal();
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
  return {
    ...base,
    name$: createBehaviorSubjectWithLifetime(base.destroy$, name),
    expr$: createBehaviorSubjectWithLifetime(base.destroy$, creationArgs2.expr),
    parameters: createObservableArrayWithLifetime(
      base.destroy$,
      creationArgs2.exFuncParameterArr
    ),

    addParameterBlank,
  };
}

const methods = {
  addParameterBlank,
};

function addParameterBlank(exFunc: CustomExFunc_) {
  return Effect.gen(function* () {
    const param = yield* ExFuncParameterFactory2({});
    exFunc.parameters.push(param);
    return param;
  });
}
