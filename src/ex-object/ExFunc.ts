import { ExItemType, type ExItemBase, type Expr } from "src/ex-object/ExItem";
import type MainContext from "src/main-context/MainContext";
import { createBehaviorSubjectWithLifetime, Utils, type SUB } from "src/utils/utils/Utils";
import unionize, { ofType } from "unionize";

export interface ExFunc extends ExItemBase {
  readonly id: string;
  readonly itemType: ExItemType.ExFunc;
  readonly name$: SUB<string>;
  readonly expr$: SUB<Expr>;
  readonly exFuncParameterArr$: SUB<ExFuncParameter[]>;
  addParameterBlank(): Promise<ExFuncParameter>;
}

export type ExFuncParameter = Awaited<ReturnType<typeof createExFuncParameter>>;

export const SystemExFuncKind = unionize({
  Add: {},
}, {
  tag: "systemExFuncKind",
});

export type SystemExFunc = typeof SystemExFuncKind._Union;

export const ExFuncKind = unionize({
  Custom: ofType<ExFunc>(),
  System: ofType<SystemExFunc>(),
});

export async function createExFunc(
  ctx: MainContext,
  data: {
    id?: string;
    name?: string;
    expr?: Expr;
    exFuncParameterArr?: ExFuncParameter[];
  }
): Promise<ExFunc> {
  const id = data.id ?? Utils.createId("ex-func");
  let name = data.name;
  const expr = data.expr ?? await ctx.objectFactory.createNumberExpr();
  const exFuncParameterArr = data.exFuncParameterArr ?? [];
  
  if (name === undefined) {
    const ordinal: number = await ctx.projectCtx.getOrdinalProm();
    name = `Function ${ordinal}`;
  }

  const base = await ctx.objectFactory.createExItemBase(id);
  const exFunc = {
    ...base,
    itemType: ExItemType.ExFunc,
    name$: createBehaviorSubjectWithLifetime(base.destroy$, name),
    expr$: createBehaviorSubjectWithLifetime(base.destroy$, expr),
    exFuncParameterArr$: createBehaviorSubjectWithLifetime(base.destroy$, exFuncParameterArr),

    async addParameterBlank() {
      const param = await createExFuncParameter(ctx);
      exFuncParameterArr.push(param);
      this.exFuncParameterArr$.next(exFuncParameterArr);
      return param;
    },
  } as ExFunc;

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