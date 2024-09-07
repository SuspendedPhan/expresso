import { Effect } from "effect";
import type { ExFunc } from "src/ex-object/ExFunc";
import type { ExItemBase } from "src/ex-object/ExItem";
import type { Expr } from "src/ex-object/Expr";
import type { SUB } from "src/utils/utils/Utils";
import { variation, fields } from "variant";

interface TestVar_ extends ExItemBase {
  args$: SUB<Expr[]>;
  exFunc$: SUB<ExFunc>;
}

export const TestVarFactory = variation("TestVar", fields<TestVar_>());
export type TestVar = ReturnType<typeof TestVarFactory>;

interface TestVarCreationArgs {
    id?: string;
}

export function TestVarFactory2(creationArgs: TestVarCreationArgs) {
  return Effect.gen(function* () {
    const creationArgs2: Required<TestVarCreationArgs> = {
        id: creationArgs.id ?? "id",
    };
  });
}

