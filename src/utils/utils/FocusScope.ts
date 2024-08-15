import { filter, fromEvent, map, of, switchMap } from "rxjs";
import type { OBS } from "./Utils";

export namespace KeyboardFuncs {
  export function onKeydown$<T>(keys: string, data$: OBS<T | null>): OBS<T> {
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
}
