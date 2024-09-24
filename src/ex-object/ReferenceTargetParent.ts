import { Effect, Layer } from "effect";
import { ComponentFactory } from "src/ex-object/Component";
import { CustomExFuncFactory } from "src/ex-object/ExFunc";
import { ExObjectFactory } from "src/ex-object/ExObject";
import type { ReferenceTarget } from "src/ex-object/Expr";
import { CloneNumberTargetFactory } from "src/ex-object/ReferenceExpr";
import { isType, matcher, variant, type TypesOf, type VariantOf } from "variant";

// todp CNT remove file

export const ReferenceTargetParent = variant([
    ExObjectFactory,
    ComponentFactory.Custom,
    CustomExFuncFactory,
  ]);

export type ReferenceTargetParent = VariantOf<typeof ReferenceTargetParent>;

export class ReferenceTargetParentCtx extends Effect.Tag("ReferenceTargetParentCtx")<
  ReferenceTargetParentCtx,
  Effect.Effect.Success<typeof ctxEffect>
>() {}

const ctxEffect = Effect.gen(function* () {
  return {
    getReferenceTargetParent: (target: ReferenceTarget): {type: string} => {
      if (isType(target, CloneNumberTargetFactory)) {
        return 
      }
  };
});

export const ReferenceTargetParentCtxLive = Layer.effect(ReferenceTargetParentCtx, ctxEffect);