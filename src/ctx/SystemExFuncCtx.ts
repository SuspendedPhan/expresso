import { Effect, Layer } from "effect";
import { SystemExFuncFactory, type SystemExFunc } from "src/ex-object/ExFunc";

export class SystemExFuncCtx extends Effect.Tag("SystemExFuncCtx")<
  SystemExFuncCtx,
  Effect.Effect.Success<typeof ctxEffect>
>() {}

const ctxEffect = Effect.gen(function* () {
  return {
    systemExFuncs: {
        "Add": SystemExFuncFactory({
            id: "Add",
            shortLabel: "+",
            parameterCount: 2,
        }),
        "Subtract": SystemExFuncFactory({
            id: "Subtract",
            shortLabel: "-",
            parameterCount: 2,
        }),
        "Multiply": SystemExFuncFactory({
            id: "Multiply",
            shortLabel: "*",
            parameterCount: 2,
        }),
        "Divide": SystemExFuncFactory({
            id: "Divide",
            shortLabel: "/",
            parameterCount: 2,
        }),
    } as Record<string, SystemExFunc>,
  };
});

export const SystemExFuncCtxLive = Layer.effect(SystemExFuncCtx, ctxEffect);