import type { Attribute } from "pixi.js";
import type { Component } from "src/ex-object/Component";
import type { LibraryProject } from "src/library/LibraryProject";
import type { SUB } from "src/utils/utils/Utils";
import type { SceneProperty } from "./SceneAttribute";

export type ExItem = Component | SceneProperty | Attribute | Expr;
export type Parent = Exclude<ExItem, NumberExpr> | null;
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

export interface ExItemBase {
  readonly id: string;
  readonly ordinal: number;
  readonly parent$: SUB<Parent>;

  // Completes when destroyed.
  readonly destroy$: SUB<void>;
}

export interface Project {
  readonly libraryProject: LibraryProject;
  readonly rootComponents$: SUB<readonly Component[]>;
  readonly currentOrdinal$: SUB<number>;
}

export interface NumberExpr extends ExItemBase {
  readonly objectType: ExItemType.Expr;
  readonly exprType: ExprType.NumberExpr;
  readonly value: number;
}

export interface CallExpr extends ExItemBase {
  readonly objectType: ExItemType.Expr;
  readonly exprType: ExprType.CallExpr;
  readonly args$: SUB<readonly Expr[]>;
}
