import { first, of } from "rxjs";
import type { OBS } from "./Utils";
import type MainContext from "src/main-context/MainContext";


// Add event listener when condition is true
// Remove event listener when condition is false

export namespace KeyboardN {
  export interface Context {

  }

  export type HaltStream = "HaltStream";
  
  export function onKeydown$<T>(data$: OBS<T | HaltStream>) {
  }
}

function test() {
  KeyboardN.onKeydown$(of(true)).subscribe(() => {

  });
}








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
