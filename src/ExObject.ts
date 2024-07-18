import { Observable } from "rxjs";
import { ProtoComponent } from "./ProtoComponent";
import { ProtoSceneAttribute, SceneAttribute } from "./SceneAttribute";

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

export interface Component extends ExObjectBase {
  readonly objectType: ExObjectType.Component;
  readonly proto: ProtoComponent;
  readonly sceneAttributeByProto: ReadonlyMap<ProtoSceneAttribute, SceneAttribute>;
  readonly cloneCount$: Observable<number>;
  readonly sceneAttributeAdded$: Observable<SceneAttribute>;
}

export interface Attribute extends ExObjectBase {
  readonly objectType: ExObjectType.Attribute;
  readonly expr$: Observable<Expr>;
}

export type Expr = NumberExpr | CallExpr;
export type Parent = Attribute | CallExpr | null;

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

export type ExObject = Attribute | Expr;