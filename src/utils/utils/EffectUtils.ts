import {
  Chunk,
  Effect,
  Option,
  Ref,
  Scope,
  Stream,
  StreamEmit,
  SubscriptionRef,
} from "effect";
import {
  BehaviorSubject,
  firstValueFrom,
  Observable,
  ReplaySubject,
} from "rxjs";
import { log5 } from "src/utils/utils/Log5";
import type { OBS } from "src/utils/utils/Utils";
import type { Readable } from "svelte/motion";
import { writable } from "svelte/store";

const log55 = log5("EffectUtils.ts");

export type DexSetup<T> = (s: Scope.Scope) => Effect.Effect<T>;

export const EffectUtils = {
  firstValueFrom<T>(source: OBS<T>): Effect.Effect<T> {
    return Effect.promise(() => firstValueFrom(source));
  },

  makeStreamFromObs<T>(obs: OBS<T>): Stream.Stream<T, never, never> {
    return this.obsToStream(obs);
  },

  obsToStream<T>(obs: Observable<T>): Stream.Stream<T, never, never> {
    const stream = Stream.async(
      (emit: StreamEmit.Emit<never, never, T, void>) => {
        obs.subscribe({
          next: (value) => {
            log55.debug("obsToStream: Emitting value", value);
            return emit(Effect.succeed(Chunk.of(value)));
          },
          // error: (error) => emit(Effect.fail(error)),
          complete: () => {
            log55.debug("obsToStream: Complete");
            return emit(Effect.fail(Option.none()));
          },
        });
      }
    );
    return stream;
  },

  streamToObs<T>(stream: Stream.Stream<T>): Effect.Effect<OBS<T>> {
    return Effect.gen(function* () {
      const subject = new ReplaySubject<T>(1);
      yield* Effect.forkDaemon(
        Stream.runForEach(stream, (value) => {
          return Effect.gen(function* () {
            log55.debug("streamToObs: Emitting value", value);
            subject.next(value);
          });
        })
      );
      return subject;
    });
  },

  /**
   * The subscription ref should be readonly. Don't call Ref.set on it.
   */
  subjectToSubscriptionRef<T>(
    subject: BehaviorSubject<T>
  ): Effect.Effect<SubscriptionRef.SubscriptionRef<T>> {
    return Effect.gen(this, function* () {
      const ref = yield* SubscriptionRef.make(subject.value);
      const values = this.obsToStream(subject);
      yield* Effect.forkDaemon(
        Stream.runForEach(values, (value) => {
          return Effect.gen(function* () {
            log55.debug("subjectToSubscriptionRef: Updating ref", value);
            yield* Ref.set(ref, value);
          });
        })
      );
      return ref;
    });
  },

  // /**
  //  * Not tested yet.
  //  */
  // switchMap<T, U>(
  //   stream: Stream.Stream<T>,
  //   f: (t: T) => Stream.Stream<U>
  // ): Stream.Stream<U> {
  //   return stream.pipe(Stream.flatMap(f, { switch: true }));
  // },

  streamToReadable<T>(
    stream: Stream.Stream<T>,
    initialValue?: T
  ): Effect.Effect<Readable<T>> {
    return Effect.gen(function* () {
      const vv = writable<T>(initialValue);

      yield* Effect.forkDaemon(
        Stream.runForEach(stream, (value) => {
          return Effect.gen(function* () {
            //   console.log("streamToReadable received a value", JSON.stringify(value));
            vv.set(value);
          });
        })
      );

      return vv;
    });
  },

  streamToReadableScoped<T>(
    stream: Stream.Stream<T>,
    scope: Scope.Scope,
    initialValue?: T,
  ): Effect.Effect<Readable<T>> {
    return Effect.gen(function* () {
      const v = writable<T>(initialValue);
      const v2 = stream.pipe(
        Stream.runForEachScoped((value) =>
          Effect.gen(function* () {
            v.set(value);
          })
        ),
        Scope.extend(scope)
      );
      yield* v2;
      return v;
    });
  },

  switchMap<T, O>(
    f: (a: T) => Stream.Stream<O>
  ): (thisStream: Stream.Stream<T>) => Stream.Stream<O> {
    return Stream.flatMap(f, {
      switch: true,
      concurrency: "unbounded",
    });
  },

  getFirstOrThrow<T>(stream: Stream.Stream<T>): Effect.Effect<T> {
    return Effect.gen(function* () {
      const first = yield* stream.pipe(Stream.take(1), Stream.runHead);
      return Option.getOrThrow(first);
    });
  },
};

export interface ReadonlySubscriptionRef<T> {
  readonly value: T;
  readonly changes: Stream.Stream<T>;
}
