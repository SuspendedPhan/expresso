import { filter, fromEvent, map, of, switchMap } from "rxjs";
import type MainContext from "src/main-context/MainContext";
import type { OBS } from "./Utils";

export enum KeyboardResult {
  OutOfScope,
}

export function createKeyboardContext(ctx: MainContext) {
  function onKeydown$<T>(keys: string, data$: OBS<T | false>) {
    return onKeydown2$({ keys, data$ });
  }

  function onKeydown2$<T>(data: {
    keys: string;
    data$: OBS<T | false>;
    preventDefault?: boolean;
  }) {
    const { keys, data$, preventDefault = false } = data;
    
    const keyArr = keys.split(",");

    return data$.pipe(
      switchMap((data) => {
        if (data === false) {
          return of();
        }

        return fromEvent<KeyboardEvent>(window, "keydown").pipe(
          filter((event) => {
            const matches = keyArr.includes(event.key);
            if (matches) {
              if (preventDefault) {
                event.preventDefault();
              }
            }
            return matches;
          }),
          map(() => data)
        );
      })
    );
  }

  return {
    onKeydown$,
    onKeydown2$,
    registerCancel: <T>(data$: OBS<T | false>) => {
      onKeydown$("Escape", data$).subscribe(() => {
        ctx.focusCtx.popFocus();
      });
    },
  };
}
