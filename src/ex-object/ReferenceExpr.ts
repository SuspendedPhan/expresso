import assert from "assert-ts";
import { Effect, Layer } from "effect";
import type { ExprKind } from "src/ex-object/Expr";
import { fields, matcher, variation } from "variant";

export const CloneNumberReferenceFactory = variation(
  "CloneNumberReference",
  fields<{
    /**
     * The id of the ex-object that holds the clone number.
     */
    id: string;
  }>()
);
export type CloneNumberReference = ReturnType<
  typeof CloneNumberReferenceFactory
>;

export class ReferenceExprCtx extends Effect.Tag("ReferenceExprCtx")<
  ReferenceExprCtx,
  Effect.Effect.Success<typeof ctxEffect>
>() {}

const ctxEffect = Effect.gen(function* () {
  return {
    getTargetIdOrNull: (ref: ExprKind["Reference"]) => {
      return ReferenceExpr_getTargetIdOrNull(ref);
    },
  };
});

export const ReferenceExprCtxLive = Layer.effect(ReferenceExprCtx, ctxEffect);

export function ReferenceExpr_getTargetIdOrNull(ref: ExprKind["Reference"]) {
  assert(ref.target !== null);
  return ref.target.id;
}
