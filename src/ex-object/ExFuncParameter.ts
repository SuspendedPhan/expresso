import { Effect } from "effect";
import { ProjectCtx } from "src/ctx/ProjectCtx";
import { ExItem, type ExItemBase } from "src/ex-object/ExItem";
import {
  type SUB,
  Utils,
  createBehaviorSubjectWithLifetime,
} from "src/utils/utils/Utils";
import { fields, variation } from "variant";

export const ExFuncParameterFactory = variation(
  "ExFuncParameter",
  fields<
    {
      name$: SUB<string>;
    } & ExItemBase
  >()
);

export type ExFuncParameter = ReturnType<typeof ExFuncParameterFactory>;
export function ExFuncParameterFactory2(
  creationArgs: ExFuncParameterCreationArgs
) {
  return Effect.gen(function* () {
    const projectCtx = yield* ProjectCtx;
    const project = yield* projectCtx.activeProject;
    const creationArgs2: Required<ExFuncParameterCreationArgs> = {
      id: creationArgs.id ?? Utils.createId("ex-func-param"),
      name:
        creationArgs.name ??
        `Parameter ${project.getAndIncrementOrdinal()}`,
    };

    const base = yield* ExItem.createExItemBase(creationArgs2.id);
    return ExFuncParameterFactory({
      ...base,
      name$: createBehaviorSubjectWithLifetime(
        base.destroy$,
        creationArgs2.name
      ),
    });
  });
}

export interface ExFuncParameterCreationArgs {
  id?: string;
  name?: string;
}
