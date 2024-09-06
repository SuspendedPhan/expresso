import type { ExItemBase } from "src/ex-object/ExItem";
import type MainContext from "src/main-context/MainContext";
import {
  type SUB,
  Utils,
  createBehaviorSubjectWithLifetime,
} from "src/utils/utils/Utils";
import { variation, fields } from "variant";

export const ExFuncParameterFactory = variation(
  "ExFuncParameter",
  fields<{
    name$: SUB<string>;
  } & ExItemBase>()
);

export type ExFuncParameter = ReturnType<typeof ExFuncParameterFactory>;
export async function ExFuncParameterFactory2(ctx: MainContext, creationArgs: ExFuncParameterCreationArgs) {
    const creationArgs2: Required<ExFuncParameterCreationArgs> = {
        id: creationArgs.id ?? Utils.createId("ex-func-param"),
        name: creationArgs.name ?? `Parameter ${await ctx.projectCtx.getOrdinalProm()}`,
    };

    const base = await ctx.objectFactory.createExItemBase(creationArgs2.id);
    return ExFuncParameterFactory({
        ...base,
        name$: createBehaviorSubjectWithLifetime(base.destroy$, creationArgs2.name),
    });
}

export interface ExFuncParameterCreationArgs {
    id?: string;
    name?: string;
}