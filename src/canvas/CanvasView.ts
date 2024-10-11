import { Effect, Layer, Ref, Stream } from "effect";
import { GlobalPropertyCtx } from "src/ex-object/GlobalProperty";
import { DexUtils } from "src/utils/utils/DexUtils";
import { CanvasFactory } from "./Canvas";

export class CanvasViewCtx extends Effect.Tag("CanvasViewCtx")<
  CanvasViewCtx,
  Effect.Effect.Success<typeof ctxEffect>
>() {}

const ctxEffect = Effect.gen(function* () {
  return {
    setup(viewportElement: HTMLElement, canvasElement: HTMLCanvasElement) {
      return Effect.gen(function* () {
        yield* CanvasFactory({ viewportElement, canvasElement });
        DexUtils.observeResize(viewportElement);
        const globalPropertyCtx = yield* GlobalPropertyCtx;
        yield* Ref.set(globalPropertyCtx.canvasWidth, canvasElement.width);
        yield* Ref.set(globalPropertyCtx.canvasHeight, canvasElement.height);

        yield* DexUtils.observeResize(viewportElement).pipe(
          Stream.runForEach((entry) =>
            Effect.gen(function* () {
              const { width, height } = entry.contentRect;
              yield* Ref.set(globalPropertyCtx.canvasWidth, width);
              yield* Ref.set(globalPropertyCtx.canvasHeight, height);
              canvasElement.width = width;
              canvasElement.height = height;
            })
          ),
          Effect.forkScoped
        );

        // resizeObs = new ResizeObserver((entries) => {
        //   Effect.gen(function* () {
        //     assert(entries.length === 1);
        //     const entry = entries[0];
        //     if (entry) {
        //     }
        //   }).pipe(DexRuntime.runPromise);
        // });
        // resizeObs.observe(viewportElement);
      });
    },
  };
});

export const CanvasViewCtxLive = Layer.effect(CanvasViewCtx, ctxEffect);
