import { Effect } from "effect";
import { LibraryCtx } from "src/ctx/LibraryCtx";
import { ExItem, type ExItemBase } from "src/ex-object/ExItem";
import type MainContext from "src/main-context/MainContext";
import {
  type SUB,
  Utils,
  createBehaviorSubjectWithLifetime,
} from "src/utils/utils/Utils";
import { variation, fields } from "variant";

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
    const libraryCtx = yield* LibraryCtx;
    const project = yield* libraryCtx.activeProject;
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
