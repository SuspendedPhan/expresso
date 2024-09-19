import { Chunk, Effect, Option, Stream, StreamEmit } from "effect";
import { firstValueFrom, Observable } from "rxjs";
import type { OBS } from "src/utils/utils/Utils";

export const EffectUtils = {
  firstValueFrom<T>(source: OBS<T>): Effect.Effect<T> {
    return Effect.promise(() => firstValueFrom(source));
  },

  obsToStream<T>(obs: Observable<T>): Stream.Stream<T, never, never> {
    const stream = Stream.async(
      (emit: StreamEmit.Emit<never, never, T, void>) => {
        obs.subscribe({
          next: (value) => emit(Effect.succeed(Chunk.of(value))),
          error: (error) => emit(Effect.fail(error)),
          complete: () => emit(Effect.fail(Option.none())),
        });
      }
    );
    return stream;
  },
};
