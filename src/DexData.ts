import { Data } from "effect"
import type { Case } from "effect/Data"

export namespace DexData {
    export const tagged = <A extends { readonly _tag: string }>(
        tag: A["_tag"]
      ): Case.Constructor<A, "_tag"> =>
      (args) => {
        const ctor = Data.tagged(tag);
        const result = ctor(args);
        return result;
      }
}