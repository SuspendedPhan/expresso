import { BehaviorSubject, filter, first, fromEvent, map, of, switchMap } from "rxjs";
import type { OBS } from "./Utils";
import type MainContext from "src/main-context/MainContext";

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

enum Focus {
  A,
  B,
  C
}
const focus$ = new BehaviorSubject<Focus>(Focus.A);
KeyboardFuncs.onKeydown$("t", focus$.pipe(
  map((focus) => focus === Focus.A ? focus : null)
)).subscribe((focus) => {
  console.log("t", focus);
  focus$.next(Focus.B);
});

KeyboardFuncs.onKeydown$("y", focus$.pipe(
  map((focus) => focus === Focus.B ? focus : null)
)).subscribe((focus) => {
  console.log("y", focus);
  focus$.next(Focus.C);
});

KeyboardFuncs.onKeydown$("u", focus$.pipe(
  map((focus) => focus === Focus.C ? focus : null)
)).subscribe((focus) => {
  console.log("u", focus);
  focus$.next(Focus.A);
});








export enum FocusScopeResult {
  OutOfScope,
}

export class FocusScope<T> {
  public constructor(
    private readonly ctx: MainContext,
    private readonly condition: OBS<T | FocusScopeResult.OutOfScope>
  ) {}

  public hotkeys(key: string, callback: (value: T) => void) {
    window.addEventListener("keydown", (event) => {
      const keys = key.split(",");
      if (!keys.includes(event.key)) {
        return;
      }

      this.condition.pipe(first()).subscribe((value) => {
        if (value !== FocusScopeResult.OutOfScope && value !== false) {
          callback(value);
          event.stopPropagation();
          event.preventDefault();
        }
      });
    });
  }

  private handleKeydown(event: KeyboardEvent) {
    console.log(event);
  }

  private handleKey(ctx: FocusScopeContext, key: string) {
    const scope = ctx.scopeArrByKey.get(key);
    if (scope) {
      scope();
    }
  }
}
