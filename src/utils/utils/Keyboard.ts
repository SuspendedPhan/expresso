import { filter, fromEvent, map, of, switchMap } from "rxjs";
import type { OBS } from "./Utils";
import type MainContext from "src/main-context/MainContext";


export function createKeyboardContext(_ctx: MainContext) {
  return {
    onKeydown$: <T>(keys: string, data$: OBS<T | null>) => {
      const keyArr = keys.split(",");
      return data$.pipe(
        switchMap((data) => {
          if (data === null) {
            return of();
          }

          return fromEvent<KeyboardEvent>(window, "keydown").pipe(
            filter((event) => keyArr.includes(event.key)),
            map(() => data)
          )
        })
      )
    }
  };
}
