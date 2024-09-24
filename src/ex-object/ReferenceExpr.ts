import assert from "assert-ts";
import { Effect, Layer } from "effect";
import type { ExprKind } from "src/ex-object/Expr";
import { fields, variation } from "variant";


export const CloneNumberTargetFactory = variation(
  "CloneNumberTarget",
  fields<{
    /**
     * The id of the ex-object that holds the clone number.
     */
    id: string;
  }>()
);
export type CloneNumberTarget = ReturnType<
  typeof CloneNumberTargetFactory
>;