import {
  Effect,
  Layer,
  Option,
  PubSub,
  Ref,
  Stream,
  SubscriptionRef,
} from "effect";
import { DexRuntime } from "src/utils/utils/DexRuntime";
import { writable, type Readable } from "svelte/store";

export interface ComboboxOption {
  label: string;
}

export interface _ComboboxOption<T extends ComboboxOption> {
  option: T;
  isFocused: boolean;
  select: () => void;
}

export interface ComboboxArgs<T extends ComboboxOption> {
  options: Stream.Stream<T[]>;
}

export interface ComboboxProps<T extends ComboboxOption> {
  propsIn: ComboboxPropsIn<T>;
  propsOut: ComboboxPropsOut<T>;
}

export interface ComboboxPropsIn<T extends ComboboxOption> {
  args: ComboboxArgs<T>;
  createState: () => Effect.Effect<ComboboxState<T>>;
}

export interface ComboboxPropsOut<T extends ComboboxOption> {
  onQueryChanged: Stream.Stream<string>;
  onOptionSelected: Stream.Stream<T>;
  onOptionFocused: Stream.Stream<T>;
}

export interface ComboboxState<T extends ComboboxOption> {
  onKeydown: (e: any) => void;
  onInput: (e: any) => void;
  query: Readable<string>;
  optionImpls: Readable<_ComboboxOption<T>[]>;
}

export class ComboboxCtx extends Effect.Tag("ComboboxCtx")<
  ComboboxCtx,
  Effect.Effect.Success<typeof ctxEffect>
>() {}

const ctxEffect = Effect.gen(function* () {
  return {
    createProps<T extends ComboboxOption>(
      args: ComboboxArgs<T>
    ): Effect.Effect<ComboboxProps<T>> {
      return Effect.gen(function* () {
        const query = yield* SubscriptionRef.make<string>("");
        const onOptionSelected = yield* PubSub.unbounded<T>();
        const onOptionFocused = yield* PubSub.unbounded<T>();

        const focusedIndex = yield* SubscriptionRef.make(Option.none<number>());

        const propsOut: ComboboxPropsOut<T> = {
          onQueryChanged: query.changes,
          onOptionSelected: Stream.fromPubSub(onOptionSelected),
          onOptionFocused: Stream.fromPubSub(onOptionFocused),
        };

        const optionImpls: Stream.Stream<_ComboboxOption<T>[]> = Stream.flatMap(
          args.options,
          (options) => {
            const extracted = Effect.gen(function* () {
              const optionImpls: Stream.Stream<_ComboboxOption<T>>[] =
                options.map((option, index) => {
                  const isFocused = Stream.map(
                    focusedIndex.changes,
                    (focusedIndex_) => {
                      return Option.match(focusedIndex_, {
                        onNone: () => false,
                        onSome: (i) => i === index,
                      });
                    }
                  );

                  const select = () => {
                    DexRuntime.runPromise(
                      Effect.gen(function* () {
                        yield* PubSub.publish(onOptionSelected, option);
                      })
                    );
                  };

                  return Stream.map(isFocused, (isFocused) => {
                    const extracted: _ComboboxOption<T> = {
                      option,
                      isFocused,
                      select,
                    };
                    return extracted;
                  });
                });

              const vv = Stream.zipLatestAll(...optionImpls);
              return vv;
            });
            return Stream.unwrap(extracted);
          },
          {
            switch: true,
            concurrency: "unbounded",
          }
        );

        yield* Effect.forkDaemon(
          Stream.runForEach(optionImpls, (optionImpls_) => {
            return Effect.gen(function* () {
              for (const optionImpl_ of optionImpls_) {
                optionImpl_.isFocused;
              }
            });
          })
        );

        const createState = () =>
          Effect.gen(function* () {
            const state: ComboboxState<T> = {
              onKeydown: (e) => {
                console.log(e);
              },
              onInput: (e) => {
                DexRuntime.runPromise(
                  Effect.gen(function* () {
                    yield* Ref.set(query, e.target.value);
                  })
                );
              },
              query: yield* streamToReadable(query.changes),
              optionImpls: yield* streamToReadable(optionImpls, []),
            };
            return state;
          });

        return {
          propsIn: { args, createState },
          propsOut,
        };
      });
    },
  };
});

export const ComboboxCtxLive = Layer.effect(ComboboxCtx, ctxEffect);

function streamToReadable<T>(
  stream: Stream.Stream<T>,
  initialValue?: T
): Effect.Effect<Readable<T>> {
  return Effect.gen(function* () {
    const vv = writable<T>(initialValue);

    yield* Effect.forkDaemon(
      Stream.runForEach(stream, (value) => {
        return Effect.gen(function* () {
          vv.set(value);
        });
      })
    );

    return vv;
  });
}
