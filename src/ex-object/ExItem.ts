import type { CallExprKind } from "src/ex-object/CallExpr";
import type { ExObject } from "src/ex-object/ExObject";
import type { ExObjectProperty } from "src/ex-object/Property";
import type { SUB } from "src/utils/utils/Utils";

export type ExItem = ExObject | ExObjectProperty | Expr;
export type Parent = Exclude<ExItem, NumberExpr> | null;
export type Expr = NumberExpr | CallExpr;

export enum ExItemType {
  ExObject,
  Property,
  Expr,
}

export enum ExprType {
  NumberExpr,
  CallExpr,
}

export interface ExItemBase {
  readonly id: string;
  readonly ordinal: number;
  readonly parent$: SUB<Parent>;

  // Completes when destroyed.
  readonly destroy$: SUB<void>;
}

export interface NumberExpr extends ExItemBase {
  readonly itemType: ExItemType.Expr;
  readonly exprType: ExprType.NumberExpr;
  readonly value: number;
}

// export interface CallExpr extends ExItemBase {
//   readonly itemType: ExItemType.Expr;
//   readonly exprType: ExprType.CallExpr;
//   readonly args$: SUB<Expr[]>;
// }

export type CallExpr = typeof CallExprKind._Union;