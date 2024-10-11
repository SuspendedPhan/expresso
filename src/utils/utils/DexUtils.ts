import assert from "assert-ts";
import { Chunk, Effect, Stream } from "effect";

export const DexUtils = {
  hasTag(obj: any): obj is { _tag: string } {
    return obj._tag !== undefined;
  },

  observeResize(element: HTMLElement): Stream.Stream<ResizeObserverEntry> {
    return Stream.asyncScoped<ResizeObserverEntry>((emit) => {
      return Effect.acquireRelease(
        Effect.gen(function* () {
          const observer = new ResizeObserver((entries) => {
            assert(entries.length === 1);
            const entry = entries[0];
            assert(entry !== undefined);
            emit(Effect.succeed(Chunk.of(entry)));
          });
          observer.observe(element);

          return observer;
        }),
        (observer) =>
          Effect.gen(function* () {
            observer.disconnect();
          })
      );
    });
  },
};
