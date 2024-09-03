import type { CustomComponentParameter } from "src/ex-object/Component";
import type { ExFunc, ExFuncParameter } from "src/ex-object/ExFunc";
import type { ExItem, Expr } from "src/ex-object/ExItem";
import type { ExObject } from "src/ex-object/ExObject";
import type { ExObjectProperty } from "src/ex-object/Property";
import type { Focus2 } from "src/utils/focus/Focus2";
import { ComponentFocusKind } from "src/utils/utils/ComponentFocus";
import { EditorFocusKind } from "src/utils/utils/EditorFocus";
import unionize, { ofType } from "unionize";

export const ExObjectFocusKind = {
  ExObject: ofType<{ exObject: ExObject }>(),
  ExObjectName: ofType<{ exObject: ExObject, isEditing: boolean }>(),
  ExObjectComponent: ofType<{ exObject: ExObject }>(),
  Property: ofType<{ property: ExObjectProperty }>(),

  ExItemNewActions: ofType<{ exItem: ExItem }>(),
  ExObjectRefactor: ofType<{ exObject: ExObject }>(),
  ExprRefactor: ofType<{ expr: Expr }>(),

  ComponentParameter: ofType<{ parameter: CustomComponentParameter, isEditing: boolean }>(),

  ExFuncName: ofType<{ exFunc: ExFunc, isEditing: boolean }>(),
  ExFuncParameter: ofType<{ parameter: ExFuncParameter, isEditing: boolean }>(),
};

export const ExprFocusKind = {
  Expr: ofType<{ expr: Expr; isEditing: boolean }>(),
};

export const NavFocusKind = {
  ProjectNav: {},
  LibraryNav: {},
};

export const FocusKind = unionize({
  None: {},
  ProjectNav: {},
  LibraryNav: {},
  ViewActions: {},
  ...EditorFocusKind,
  ...ComponentFocusKind,
  ...ExObjectFocusKind,
  ...ExprFocusKind,
  Focus2: ofType<{ focus2: Focus2 }>(),
});

// FocusKind.Component

// log55.debug(FocusKind._TaggedRecord.Component); //