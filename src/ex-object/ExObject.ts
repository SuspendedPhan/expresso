import type { Observable } from "rxjs";
import type { ProtoComponent } from "src/ex-object/ProtoComponent";
import type { ProtoSceneProperty, SceneProperty } from "./SceneAttribute";
import { OBS } from "src/utils/utils/Utils";
import { LibraryProject } from "src/library/LibraryProject";

export type ExObject = Component | Attribute | Expr;
export type Parent = Component | Attribute | CallExpr | null;
export type Expr = NumberExpr | CallExpr;

export enum ExItemType {
  SceneProperty,

  ExObject,
  Property,
  Expr,
}

export enum ExprType {
  NumberExpr,
  CallExpr,
}

export interface ExObjectBase {
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
  readonly objectType: ExItemType.ExObject;
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
