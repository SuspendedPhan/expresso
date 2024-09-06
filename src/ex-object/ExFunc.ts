import { Effect } from "effect";
import { LibraryCtx } from "src/ctx/LibraryCtx";
import {
  ExFuncParameterFactory2,
  type ExFuncParameter,
} from "src/ex-object/ExFuncParameter";
import { ExItem, type ExItemBase } from "src/ex-object/ExItem";
import { ExprFactory2, type Expr } from "src/ex-object/Expr";
import { createObservableArrayWithLifetime, type ObservableArray } from "src/utils/utils/ObservableArray";
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

interface CustomExFunc_ extends ExItemBase {
  id: string;
  name$: SUB<string>;
  expr$: SUB<Expr>;
  parameters: ObservableArray<ExFuncParameter>;
  addParameterBlank(): Effect.Effect<ExFuncParameter>;
}

export const SystemExFuncFactory = dexScopedVariant("ExFunc/System", {
  Add: {},
});

export type SystemExFunc = VariantOf<typeof SystemExFuncFactory>;
export type SystemExFuncKind = DexVariantKind<typeof SystemExFuncFactory>;

export const CustomExFuncFactory = variation(
  "ExFunc/Custom",
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
      const libraryCtx = yield* LibraryCtx;
      let name = creationArgs.name;
      if (name === undefined) {
        const project = yield* libraryCtx.activeProject;
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

      if (name === undefined) {
        const ordinal: number = await ctx.projectCtx.getOrdinalProm();
        name = `Function ${ordinal}`;
      }

      const base = yield* ExItem.createExItemBase(creationArgs2.id);
      return CustomExFuncFactory({
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

        addParameterBlank() {
          const exFunc = this;
          return Effect.gen(function* () {
            const param = yield* ExFuncParameterFactory2({});
            exFunc.parameters.push(param);
            return param;
          });
        },
      });
    });
  },
};
