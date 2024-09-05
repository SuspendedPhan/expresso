import type { ExItemBase } from "src/ex-object/ExItem";
import type { Expr } from "src/ex-object/Expr";
import type MainContext from "src/main-context/MainContext";
import {
  createBehaviorSubjectWithLifetime,
  Utils,
  type SUB,
} from "src/utils/utils/Utils";
import { dexScopedVariant, type DexVariantKind } from "src/utils/utils/VariantUtils4";
import { fields, variant, type VariantOf } from "variant";

interface CustomExFunc extends ExItemBase {
  readonly id: string;
  readonly name$: SUB<string>;
  readonly expr$: SUB<Expr>;
  readonly exFuncParameterArr$: SUB<ExFuncParameter[]>;
  addParameterBlank(): Promise<ExFuncParameter>;
}

export interface ExFuncParameter
  extends Awaited<ReturnType<typeof createExFuncParameter>> {}

export const SystemExFuncFactory = variant({
  Add: {},
});

export type SystemExFunc = VariantOf<typeof SystemExFuncFactory>;
export type SystemExFuncKind = DexVariantKind<typeof SystemExFuncFactory>;

export const ExFuncFactory = dexScopedVariant("ExFunc", {
  Custom: fields<CustomExFunc>(),
  System: fields<SystemExFunc>(),
});

export type ExFunc = VariantOf<typeof ExFuncFactory>;
export type ExFuncKind = DexVariantKind<typeof ExFuncFactory>;

export const ExFuncFactory2 = {
  async Custom(
    ctx: MainContext,
    data: {
      id?: string;
      name?: string;
      expr?: Expr;
      exFuncParameterArr?: ExFuncParameter[];
    }
  ) {
    const id = data.id ?? Utils.createId("ex-func");
    let name = data.name;
    const expr = data.expr ?? (await ctx.objectFactory.createNumberExpr());
    const exFuncParameterArr = data.exFuncParameterArr ?? [];

    if (name === undefined) {
      const ordinal: number = await ctx.projectCtx.getOrdinalProm();
      name = `Function ${ordinal}`;
    }

    const base = await ctx.objectFactory.createExItemBase(id);
    return ExFuncFactory.Custom({
      ...base,
      name$: createBehaviorSubjectWithLifetime(base.destroy$, name),
      expr$: createBehaviorSubjectWithLifetime(base.destroy$, expr),
      exFuncParameterArr$: createBehaviorSubjectWithLifetime(
        base.destroy$,
        exFuncParameterArr
      ),

      async addParameterBlank() {
        const param = await createExFuncParameter(ctx);
        exFuncParameterArr.push(param);
        this.exFuncParameterArr$.next(exFuncParameterArr);
        return param;
      },
    });
  },
};

export async function createExFunc(
  ctx: MainContext,
  data: {
    id?: string;
    name?: string;
    expr?: Expr;
    exFuncParameterArr?: ExFuncParameter[];
  }
): Promise<CustomExFunc> {
  const id = data.id ?? Utils.createId("ex-func");
  let name = data.name;
  const expr = data.expr ?? (await ctx.objectFactory.createNumberExpr());
  const exFuncParameterArr = data.exFuncParameterArr ?? [];

  if (name === undefined) {
    const ordinal: number = await ctx.projectCtx.getOrdinalProm();
    name = `Function ${ordinal}`;
  }

  const base = await ctx.objectFactory.createExItemBase(id);
  const exFunc = {
    ...base,
    name$: createBehaviorSubjectWithLifetime(base.destroy$, name),
    expr$: createBehaviorSubjectWithLifetime(base.destroy$, expr),
    exFuncParameterArr$: createBehaviorSubjectWithLifetime(
      base.destroy$,
      exFuncParameterArr
    ),

    async addParameterBlank() {
      const param = await createExFuncParameter(ctx);
      exFuncParameterArr.push(param);
      this.exFuncParameterArr$.next(exFuncParameterArr);
      return param;
    },
  } as CustomExFunc;

  expr.parent$.next(exFunc);
  return exFunc;
}

export async function createExFuncParameter(
  ctx: MainContext,
  data?: {
    id?: string;
    name?: string;
  }
) {
  data ??= {};
  const id = data.id ?? Utils.createId("ex-func-param");
  let name = data.name;

  if (name === undefined) {
    const ordinal: number = await ctx.projectCtx.getOrdinalProm();
    name = `Parameter ${ordinal}`;
  }

  const base = await ctx.objectFactory.createExItemBase(id);
  return {
    ...base,
    name$: createBehaviorSubjectWithLifetime(base.destroy$, name),
  };
}
