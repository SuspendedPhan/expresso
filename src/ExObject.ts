import { Observable } from "rxjs";

export enum ExObjectType {
  Expr,
  Attribute,
}
export enum ExprType {
  NumberExpr,
  CallExpr,
}

interface ExObjectBase {
  readonly objectType: ExObjectType;
  readonly id: string;
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
  readonly args: readonly Observable<Expr>[];
}

export type ExObject = Attribute | Expr;