import type { Observable } from "rxjs";
import type { ProtoComponent } from "src/ex-object/ProtoComponent";
import type { ProtoSceneAttribute, SceneAttribute } from "./SceneAttribute";

export type ExObject = Component | Attribute | Expr;
export type Parent = Component | Attribute | CallExpr | null;
export type Expr = NumberExpr | CallExpr;

export enum ExObjectType {
  SceneAttribute,

  Component,
  Attribute,
  Expr,
}

export enum ExprType {
  NumberExpr,
  CallExpr,
}

export interface ExObjectBase {
  readonly id: string;
  readonly parent$: Observable<Parent>;

  // Completes when destroyed.
  readonly destroy$: Observable<void>;
}

export interface Project {
  readonly rootComponents$: Observable<Component[]>;
}

export interface Component extends ExObjectBase {
  readonly objectType: ExObjectType.Component;
  readonly proto: ProtoComponent;
  readonly sceneAttributeByProto: ReadonlyMap<ProtoSceneAttribute, SceneAttribute>;
  readonly cloneCount$: Observable<number>;
  readonly children$: Observable<readonly Component[]>;
  readonly sceneAttributeAdded$: Observable<SceneAttribute>;
}

export interface Attribute extends ExObjectBase {
  readonly objectType: ExObjectType.Attribute;
  readonly expr$: Observable<Expr>;
}

export interface NumberExpr extends ExObjectBase {
  readonly objectType: ExObjectType.Expr;
  readonly exprType: ExprType.NumberExpr;
  readonly value: number;
}

export interface CallExpr extends ExObjectBase {
  readonly objectType: ExObjectType.Expr;
  readonly exprType: ExprType.CallExpr;
  readonly args$: Observable<readonly Expr[]>;
}
