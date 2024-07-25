import hotkeys from "hotkeys-js";
import { OBS } from "./Utils";
import { first } from "rxjs";

export class KeyboardScope {
    public constructor(private readonly condition: OBS<boolean>) {
        
    }

    public hotkeys(key: string, callback: () => void) {
        hotkeys(key, (_event, _handler) => {
            this.condition.pipe(first()).subscribe((value) => {
                if (value) {
                    callback();
                }
            });
        });
    }
}