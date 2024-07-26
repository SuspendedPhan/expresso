import type { Observable } from "rxjs";
import type { ProtoComponent } from "src/ex-object/ProtoComponent";
import type { ProtoSceneProperty, SceneProperty } from "./SceneAttribute";
import type { LibraryProject } from "src/library/LibraryProject";
import type { OBS } from "src/utils/utils/Utils";

export type ExObject = Component | SceneProperty | Attribute | Expr;
export type Parent = Exclude<ExObject, NumberExpr>;
export type Expr = NumberExpr | CallExpr;

export enum ExItemType {
  SceneProperty,

  Component,
  Property,
  Expr,
}

export enum ExprType {
  NumberExpr,
  CallExpr,
}

export interface ExObjectBase {
  readonly objectType: ExItemType;
  readonly id: string;
  readonly ordinal: number;
  readonly parent$: Observable<Parent>;

  // Completes when destroyed.
  readonly destroy$: Observable<void>;
}

export interface Project {
  readonly libraryProject: LibraryProject;
  readonly rootComponents$: Observable<readonly Component[]>;
  readonly currentOrdinal$: OBS<number>;
}

export interface Component extends ExObjectBase {
  readonly objectType: ExItemType.Component;
  readonly proto: ProtoComponent;
  readonly sceneAttributeByProto: ReadonlyMap<ProtoSceneProperty, SceneProperty>;
  readonly cloneCount$: Observable<number>;
  readonly children$: Observable<readonly Component[]>;
  readonly sceneAttributeAdded$: Observable<SceneProperty>;
}

export interface Attribute extends ExObjectBase {
  readonly objectType: ExItemType.Property;
  readonly expr$: Observable<Expr>;
}

export interface NumberExpr extends ExObjectBase {
  readonly objectType: ExItemType.Expr;
  readonly exprType: ExprType.NumberExpr;
  readonly value: number;
}

export interface CallExpr extends ExObjectBase {
  readonly objectType: ExItemType.Expr;
  readonly exprType: ExprType.CallExpr;
  readonly args$: Observable<readonly Expr[]>;
}
