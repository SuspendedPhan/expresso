import { filter, fromEvent, map, of, switchMap } from "rxjs";
import type MainContext from "src/main-context/MainContext";
import type { OBS } from "./Utils";

export enum KeyboardResult {
  OutOfScope,
}

export function createKeyboardContext(_ctx: MainContext) {
  return {
    onKeydown$: <T>(keys: string, data$: OBS<T | null> | OBS<boolean>, tag = "") => {
      const keyArr = keys.split(",");
      console.log("keyArr", keyArr);

      return data$.pipe(
        switchMap((data) => {
          if (data === null) {
            return of();
          }

          if (tag === "hi") {
            console.log("data", data);
          }

          return fromEvent<KeyboardEvent>(window, "keydown").pipe(
            filter((event) => {
              if (tag === "hi") {
                console.log("data2", data);
              }

              const newLocal = keyArr.includes(event.key);
              return newLocal;
            }),
            map(() => data)
          );
        })
      );
    },
  };
}
