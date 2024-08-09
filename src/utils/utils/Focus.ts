import { map } from "rxjs";
import type { ExObject } from "src/ex-object/ExObject";
import type MainContext from "src/main-context/MainContext";
import type { OBS } from "src/utils/utils/Utils";

export class FocusBase {
  public type = typeof this;
  public isEditing: boolean = false;
}

export namespace ExObjectFocus {
  export interface Data {
    exObject: ExObject;
    isEditing: boolean;
  }

  export class Base extends FocusBase {
    public exObject: ExObject;

    constructor(data: Data) {
      super();
      this.exObject = data.exObject;
      this.isEditing = data.isEditing;
    }
  }

  export class Name extends Base {
    constructor(data: Data) {
      super(data);
    }

    public static isFocused$(ctx: MainContext, exObject: ExObject): OBS<boolean> {
      return ctx.focusManager.getFocus$().pipe(
        map((focus) => {
          if (focus instanceof ExObjectFocus.Name) {
            return focus.exObject === exObject;
          }
          return false;
        })
      );
    }
  }

  export class Component extends Base {
    constructor(data: Data) {
      super(data);
    }

    public static isFocused$(ctx: MainContext, exObject: ExObject): OBS<boolean> {
      return ctx.focusManager.getFocus$().pipe(
        map((focus) => {
          if (focus instanceof ExObjectFocus.Component) {
            return focus.exObject === exObject;
          }
          return false;
        })
      );
    }
  }
}
