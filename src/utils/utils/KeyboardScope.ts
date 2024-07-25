import hotkeys from "hotkeys-js";
import { OBS } from "./Utils";
import { first } from "rxjs";

export enum KeyboardScopeResult {
  OutOfScope,
}

export class KeyboardScope<T> {
  public constructor(
    private readonly condition: OBS<T | KeyboardScopeResult.OutOfScope>
  ) {}

  public hotkeys(key: string, callback: (value: T) => void) {
    hotkeys(key, { keydown: true, keyup: true }, (_event, _handler) => {
      this.condition.pipe(first()).subscribe((value) => {
        if (value !== KeyboardScopeResult.OutOfScope && value !== false) {
          callback(value);
        }
      });
    });
  }

  public setChordPrefix(_prefix: string) {
    // this.prefix = prefix;
  }
}
