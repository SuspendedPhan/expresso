import { map } from "rxjs";
import type { ExObject } from "src/ex-object/ExObject";
import type MainContext from "src/main-context/MainContext";
import {
  Focus2Union,
  type Focus,
  type Focus2,
} from "src/utils/utils/FocusManager";
import { ProjectComponentListFocusUnion } from "src/utils/utils/ProjectComponentListFocus";
import type { OBS } from "src/utils/utils/Utils";

export class FocusBase {
  public type = typeof this;
  public isEditing: boolean = false;
  public startEditing: ((ctx: MainContext) => void) | null = null;
  public get isEditable() {
    return this.startEditing !== null;
  }

  public get isCancelable() {
    return this.isEditing;
  }
}

export namespace FocusFns {
  export function isFocus2Focused$(
    ctx: MainContext,
    predicate: (focus2: Focus2) => boolean
  ): OBS<boolean> {
    return ctx.focusManager.getFocus$().pipe(
      map((focus) => {
        return focus.type === "Focus2" && predicate(focus.focus2);
      })
    );
  }

  export function isCancelable(focus: Focus) {
    if (focus instanceof FocusBase) {
      return focus.isCancelable;
    }
    const isCancelableFocus2 =
      focus.type === "Focus2" &&
      Focus2Union.match(focus.focus2, {
        ViewActions: () => true,
        ProjectNav: () => true,
        LibraryNav: () => true,
        EditorNewActions: () => true,
        ProjectComponentList: (focus2) => {
          return ProjectComponentListFocusUnion.match(focus2.pclFocus, {
            NewActionsFocus: () => true,
            default: () => false,
          });
        },
        default: () => false,
      });
    const isCancelableFocus =
      focus.type === "ExprReplaceCommand" || isCancelableFocus2;
    if (isCancelableFocus) {
      return true;
    }
    return false;
  }
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
      this.startEditing = (ctx: MainContext) => {
        console.log("startEditing");

        ctx.focusManager.focus(
          new Name({
            exObject: this.exObject,
            isEditing: true,
          })
        );
      };
    }

    public static isFocused$(
      ctx: MainContext,
      exObject: ExObject
    ): OBS<boolean> {
      return ctx.focusManager.getFocus$().pipe(
        map((focus) => {
          if (focus instanceof ExObjectFocus.Name) {
            return focus.exObject === exObject;
          }
          return false;
        })
      );
    }

    public static isEditing$(
      ctx: MainContext,
      exObject: ExObject
    ): OBS<boolean> {
      return ctx.focusManager.getFocus$().pipe(
        map((focus) => {
          if (focus instanceof ExObjectFocus.Name) {
            return focus.exObject === exObject && focus.isEditing;
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

    public static isFocused$(
      ctx: MainContext,
      exObject: ExObject
    ): OBS<boolean> {
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
