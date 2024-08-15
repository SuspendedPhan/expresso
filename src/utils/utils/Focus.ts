import { map } from "rxjs";
import type { ExObject } from "src/ex-object/ExObject";
import type MainContext from "src/main-context/MainContext";
import {
  Focus2Kind,
  type Focus,
  type Focus2,
} from "src/utils/utils/FocusManager";
import { ProjectComponentListFocusKind } from "src/utils/utils/ProjectComponentListFocus";
import type { OBS } from "src/utils/utils/Utils";

export enum FocusKeys {
  Down = "ArrowDown,s",
}


export namespace FocusFns {
  export function getFocus$(ctx: MainContext): OBS<Focus> {
    return ctx.focusManager.getFocus$();
  }

  export function focus(ctx: MainContext, focus2: Focus2) {
    ctx.focusManager.focus({ type: "Focus2", focus2 });
  }

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

  export function isNoneFocused$(ctx: MainContext): OBS<boolean> {
    return ctx.focusManager.getFocus$().pipe(
      map((focus) => {
        return focus.type === "Focus2" && Focus2Kind.is.None(focus.focus2);
      })
    );
  }

  export function isCancelable(focus: Focus) {
    if (focus instanceof FocusBase) {
      return focus.isCancelable;
    }
    const isCancelableFocus2 =
      focus.type === "Focus2" &&
      Focus2Kind.match(focus.focus2, {
        ViewActions: () => true,
        ProjectNav: () => true,
        LibraryNav: () => true,
        EditorNewActions: () => true,
        ProjectComponentList: (focus2) => {
          return ProjectComponentListFocusKind.match(focus2.pclFocus, {
            NewActions: () => true,
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

// ---------------------------------------------------------------
export class FocusBase {
  public type = typeof this;
  public isEditing = false;
  public startEditing: ((ctx: MainContext) => void) | null = null;
  public get isEditable() {
    return this.startEditing !== null;
  }

  public get isCancelable() {
    return this.isEditing;
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
