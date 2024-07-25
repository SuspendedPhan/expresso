import hotkeys from "hotkeys-js";
import { OBS } from "./Utils";
import { first } from "rxjs";

export class KeyboardScope {
  private prefix: string | null = null;
  public constructor(private readonly condition: OBS<boolean>) {}

  public hotkeys(key: string, callback: () => void) {
    hotkeys(key, (_event, _handler) => {
      this.condition.pipe(first()).subscribe((value) => {
        if (value) {
          callback();
        }
      });
    });

    if (this.prefix) {
      hotkeys(this.prefix + "+" + key, (_event, _handler) => {
        this.condition.pipe(first()).subscribe((value) => {
          if (value) {
            callback();
          }
        });
      });
    }
  }

  public setChordPrefix(prefix: string) {
    this.prefix = prefix;
  }
}
