import { Chunk, Effect, Option, Stream, StreamEmit } from "effect";
import { firstValueFrom, Observable } from "rxjs";
import { log5 } from "src/utils/utils/Log5";
import type { OBS } from "src/utils/utils/Utils";

const log55 = log5("EffectUtils.ts");

export const EffectUtils = {
  firstValueFrom<T>(source: OBS<T>): Effect.Effect<T> {
    return Effect.promise(() => firstValueFrom(source));
  },

  obsToStream<T>(obs: Observable<T>): Stream.Stream<T, never, never> {
    const stream = Stream.async(
      (emit: StreamEmit.Emit<never, never, T, void>) => {
        obs.subscribe({
          next: value => {
            log55.debug("obsToStream: Emitting value", value);
            return emit(Effect.succeed(Chunk.of(value)));
          },
          error: (error) => emit(Effect.fail(error)),
          complete: () => {
            log55.debug("obsToStream: Complete");
            return emit(Effect.fail(Option.none()));
          },
        });
      }
    );
    return stream;
  },
};
