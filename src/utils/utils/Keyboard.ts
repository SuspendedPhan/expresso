import { filter, fromEvent, map, of, switchMap } from "rxjs";
import type MainContext from "src/main-context/MainContext";
import type { OBS } from "./Utils";

export enum KeyboardResult {
  OutOfScope,
}

export function createKeyboardContext(ctx: MainContext) {
  function onKeydown$<T>(keys: string, data$: OBS<T | false>, _tag = "") {
    const keyArr = keys.split(",");

    return data$.pipe(
      switchMap((data) => {
        if (data === false) {
          return of();
        }

        return fromEvent<KeyboardEvent>(window, "keydown").pipe(
          filter((event) => {
            const newLocal = keyArr.includes(event.key);
            return newLocal;
          }),
          map(() => data)
        );
      })
    );
  }

  return {
    onKeydown$,
    registerCancel: <T>(data$: OBS<T | false>) => {
      onKeydown$("Escape", data$).subscribe(() => {
        ctx.focusCtx.popFocus();
      });
    },
  };
}
