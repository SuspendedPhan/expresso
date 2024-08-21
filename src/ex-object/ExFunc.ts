import type { Expr } from "src/ex-object/ExItem";
import type MainContext from "src/main-context/MainContext";
import { createBehaviorSubjectWithLifetime, Utils } from "src/utils/utils/Utils";

export type ExFunc = ReturnType<typeof createExFunc>;
export type ExFuncParameter = ReturnType<typeof createExFuncParameter>;

export async function createExFunc(
  ctx: MainContext,
  data?: {
    id?: string;
    name?: string;
    expr?: Expr;
    exFuncParameterArr?: ExFuncParameter[];
  }
) {
  data ??= {};
  const id = data.id ?? Utils.createId("ex-func");
  let name = data.name;
  const expr = data.expr ?? ctx.objectFactory.createNumberExpr();
  const exFuncParameterArr = data.exFuncParameterArr ?? [];
  
  if (name === undefined) {
    const ordinal: number = await ctx.projectCtx.getOrdinalProm();
    name = `Function ${ordinal}`;
  }

  const base = await ctx.objectFactory.createExItemBase(id);
  return {
    ...base,
    name$: createBehaviorSubjectWithLifetime(base.destroy$, name),
    expr$: createBehaviorSubjectWithLifetime(base.destroy$, expr),
    exFuncParameterArr$: createBehaviorSubjectWithLifetime(base.destroy$, exFuncParameterArr),
  };
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