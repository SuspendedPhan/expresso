import assert from "assert-ts";
import {
  Effect,
  Equivalence,
  Layer,
  Option,
  PubSub,
  Ref,
  Stream,
  SubscriptionRef,
} from "effect";
import type { Scope } from "effect/Scope";
import type { KeyboardCtx } from "src/ctx/KeyboardCtx";
import type { FocusCtx } from "src/focus/FocusCtx";
import { DexRuntime } from "src/utils/utils/DexRuntime";
import { EffectUtils } from "src/utils/utils/EffectUtils";
import { type Readable } from "svelte/store";

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
  createState: () => Effect.Effect<ComboboxState<T>>;
}

export interface ComboboxPropsOut<T extends ComboboxOption> {
  onQueryChanged: Stream.Stream<string>;
  onOptionSelected: Stream.Stream<T>;
  focusedOption: Stream.Stream<Option.Option<T>>;
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

// let ccc = 0;

const ctxEffect = Effect.gen(function* () {
  return {
    createProps<T extends ComboboxOption>(
      args: ComboboxArgs<T>
    ): Effect.Effect<ComboboxProps<T>, never, Scope | FocusCtx | KeyboardCtx> {
      return Effect.gen(function* () {
        const query = yield* SubscriptionRef.make<string>("");
        const onOptionSelected = yield* PubSub.unbounded<T>();

        const focusedIndex = yield* SubscriptionRef.make(Option.none<number>());

        const focusedOption = Stream.zipLatest(
          focusedIndex.changes,
          args.options
        ).pipe(
          Stream.map(([focusedIndex_, options]) => {
            return Option.map(focusedIndex_, i => {
              const opt = options[i];
              assert(opt !== undefined);
              return opt;
            });
          })
        );

        const propsOut: ComboboxPropsOut<T> = {
          onQueryChanged: query.changes,
          onOptionSelected: Stream.fromPubSub(onOptionSelected),
          focusedOption,
        };

        // yield* Effect.forkDaemon(
        //   Stream.runForEach(args.options, (_value) => {
        //     return Effect.gen(function* () {
        //       //   console.log("Options changed2", value);
        //     });
        //   })
        // );

        // Generating the options.
        const optionImpls_: Stream.Stream<_ComboboxOption<T>[]> =
          Stream.flatMap(
            args.options,
            (options) => {
              // const ddd = ccc++;
              // console.log("Options changed", options, ddd);
              const extracted = Effect.gen(function* () {
                if (options.length === 0) {
                  return Stream.succeed([]);
                }

                const optionImpls: Stream.Stream<_ComboboxOption<T>>[] =
                  options.map((option, index) => {
                    // console.log("Mapping option", index, option);
                    const isFocused = Stream.map(
                      focusedIndex.changes,
                      (focusedIndex_) => {
                        // console.log(
                        //   "Focused index changed",
                        //   index,
                        //   focusedIndex_
                        // );
                        return Option.match(focusedIndex_, {
                          onNone: () => false,
                          onSome: (i) => i === index,
                        });
                      }
                    ).pipe(Stream.changes);

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
                        // console.log("Computed option", index, extracted);
                      return extracted;
                    });
                  });

                const vv = Stream.zipLatestAll(...optionImpls)
                  .pipe
                  // Stream.tap(() =>
                  //   Console.log("Original options", ddd, options)
                  // ),
                  // Stream.tap((value) =>
                  //   Console.log("Computed options", ddd, value)
                  // )
                  ();
                return vv;
              });
              return Stream.unwrap(extracted);
            },
            {
              switch: true,
            }
          );

        const optionImpls = yield* SubscriptionRef.make<_ComboboxOption<T>[]>(
          []
        );
        yield* Effect.forkDaemon(
          Stream.runForEach(optionImpls_, (value) => {
            return Effect.gen(function* () {
              // console.log("Setting optionImpls", value);
              yield* Ref.set(optionImpls, value);
            });
          })
        );

        // If focusedIndex is bigger than the number of options, then we should reset it to the last option.
        yield* Effect.forkDaemon(
          Stream.runForEach(optionImpls.changes, (optionImpls_) => {
            return Effect.gen(function* () {
              const focusedIndex_ = yield* focusedIndex.get;
              const newIndex = Option.map(focusedIndex_, (i) => {
                if (i >= optionImpls_.length) {
                  return optionImpls_.length - 1;
                }

                if (i < 0) {
                  return 0;
                }
                return i;
              });
              const newIndex2 = Option.orElse(newIndex, () => {
                if (optionImpls_.length > 0) {
                  return Option.some(0);
                }
                return Option.none();
              });

              const eq = Option.getEquivalence(Equivalence.number);
              if (eq(focusedIndex_, newIndex2) === false) {
                // console.log(
                //   "Making sure focusedIndex is within bounds",
                //   focusedIndex_,
                //   newIndex
                // );
                yield* Ref.set(focusedIndex, newIndex2);
              }
            });
          })
        );

        const createState = () =>
          Effect.gen(function* () {
            const state: ComboboxState<T> = {
              onKeydown: (e) => {
                DexRuntime.runPromise(
                  Effect.gen(function* () {
                    // Down:
                    // If focusedIndex is none, then we should focus the first option.
                    // If focusedIndex is some, then we should focus the next option.
                    // If focusedIndex is the last option, then we should leave it as is.

                    // Up:
                    // If focusedIndex is none, then we should focus the last option.
                    // If focusedIndex is some, then we should focus the previous option.
                    // If focusedIndex is the first option, then we should leave it as is.

                    // Enter:
                    // Select the focused option if any.

                    const options = yield* optionImpls.get;
                    const index = yield* focusedIndex.get;

                    switch (e.key) {
                      case "ArrowDown": {
                        const newIndex = Option.match(index, {
                          onNone: () => Option.some(0),
                          onSome: (i) => {
                            return Option.some(
                              Math.min(i + 1, options.length - 1)
                            );
                          },
                        });
                        // console.log("Down (old, new)", index, newIndex);
                        yield* Ref.set(focusedIndex, newIndex);
                        break;
                      }
                      case "ArrowUp": {
                        const newIndex = Option.match(index, {
                          onNone: () => Option.some(options.length - 1),
                          onSome: (i) => {
                            return Option.some(Math.max(i - 1, 0));
                          },
                        });
                        // console.log("Up (old, new)", index, newIndex);
                        yield* Ref.set(focusedIndex, newIndex);
                        break;
                      }
                      case "Enter": {
                        Option.match(index, {
                          onNone: () => {},
                          onSome: (i) => {
                            const option = options[i];
                            assert(option !== undefined);
                            option.select();
                          },
                        });
                        break;
                      }
                    }
                  })
                );
              },
              onInput: (e) => {
                DexRuntime.runPromise(
                  Effect.gen(function* () {
                    yield* Ref.set(query, e.target.value);
                  })
                );
              },
              query: yield* EffectUtils.streamToReadable(query.changes),
              optionImpls: yield* EffectUtils.streamToReadable(
                optionImpls.changes,
                []
              ),
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
