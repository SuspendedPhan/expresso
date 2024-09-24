import { Effect, Layer } from "effect";
import { ExItem, type ExItemBase } from "src/ex-object/ExItem";
import { Utils } from "src/utils/utils/Utils";
import { fields, variation } from "variant";

interface CloneNumberTarget_ extends ExItemBase {}

export const CloneNumberTargetFactory = variation(
  "CloneNumberTarget",
  fields<CloneNumberTarget_>()
);
export type CloneNumberTarget = ReturnType<typeof CloneNumberTargetFactory>;

interface CloneNumberTargetCreationArgs {
  id?: string;
}

export class CloneNumberTargetCtx extends Effect.Tag("CloneNumberTargetCtx")<
  CloneNumberTargetCtx,
  Effect.Effect.Success<typeof ctxEffect>
>() {}

const ctxEffect = Effect.gen(function* () {
  return {
    create(creationArgs: CloneNumberTargetCreationArgs) {
      return Effect.gen(function* () {
        const creationArgs2: Required<CloneNumberTargetCreationArgs> = {
          id: creationArgs.id ?? Utils.createId("clone-number"),
        };

        const base = yield* ExItem.createExItemBase(creationArgs2.id);
        const cloneNumberTarget = CloneNumberTargetFactory({
          ...base,
        });

        return cloneNumberTarget;
      });
    },
  };
});

export const CloneNumberTargetCtxLive = Layer.effect(CloneNumberTargetCtx, ctxEffect);
