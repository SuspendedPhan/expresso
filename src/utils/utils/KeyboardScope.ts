import { first } from "rxjs";
import type { OBS } from "./Utils";

export enum KeyboardScopeResult {
  OutOfScope,
}

export class KeyboardScope<T> {
  public constructor(
    private readonly condition: OBS<T | KeyboardScopeResult.OutOfScope>
  ) {}

  public hotkeys(key: string, callback: (value: T) => void) {
    window.addEventListener("keydown", (event) => {
      const keys = key.split(",");
      if (!keys.includes(event.key)) {
        return;
      }

      this.condition.pipe(first()).subscribe((value) => {
        if (value !== KeyboardScopeResult.OutOfScope && value !== false) {
          callback(value);
          event.stopPropagation();
          event.preventDefault();
        }
      });
    });
    // hotkeys(key, { keydown: true }, (_event, _handler) => {
    //   console.log("hotkeys", key);
      
    //   this.condition.pipe(first()).subscribe((value) => {
    //     if (value !== KeyboardScopeResult.OutOfScope && value !== false) {
    //       callback(value);
    //     }
    //   });
    // });
  }

  public setChordPrefix(_prefix: string) {
    // this.prefix = prefix;
  }
}
