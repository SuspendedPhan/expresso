import { BehaviorSubject, firstValueFrom, Subject } from "rxjs";
import type { Component } from "src/ex-object/Component";
import {
  type CallExpr,
  type ExItemBase,
  ExItemType,
  type Expr,
  ExprType,
  type NumberExpr,
  type Parent,
} from "src/ex-object/ExItem";
import type { ExObject } from "src/ex-object/ExObject";
import { ProjectFns, type Project } from "src/ex-object/Project";
import type { LibraryProject } from "src/library/LibraryProject";
import type MainContext from "src/main-context/MainContext";
import { loggedMethod } from "src/utils/logger/LoggerDecorator";
import {
  createBehaviorSubjectWithLifetime
} from "src/utils/utils/Utils";

export default class ExObjectFactory {
  public constructor(private readonly ctx: MainContext) {
  }

  public createProject(libraryProject: LibraryProject, rootObjects: readonly ExObject[]): Project {
    const destroy$ = new Subject<void>();

    const project: Project = {
      destroy$,
      libraryProject,
      rootExObjects$: createBehaviorSubjectWithLifetime(destroy$, rootObjects),
      components$: new BehaviorSubject<Component[]>([]),
      currentOrdinal$: new BehaviorSubject<number>(0),
    };

    return project;
  }


  @loggedMethod
  public async createNumberExpr(value?: number, id?: string): Promise<NumberExpr> {
    if (id === undefined) {
      id = `expr-${crypto.randomUUID()}`;
    }

    if (value === undefined) {
      value = 0;
    }

    const base = await this.createExItemBase(id);

    const expr: NumberExpr = {
      itemType: ExItemType.Expr,
      exprType: ExprType.NumberExpr,
      value,
      ...base,
    };

    (this.ctx.eventBus.exprAdded$ as Subject<Expr>).next(expr);
    return expr;
  }

  @loggedMethod
  public async createCallExpr(id?: string, args?: Expr[]): Promise<CallExpr> {
    if (id === undefined) {
      id = `expr-${crypto.randomUUID()}`;
    }

    if (args === undefined) {
      const arg0 = await this.createNumberExpr();
      const arg1 = await this.createNumberExpr();
      args = [arg0, arg1];
    }

    const base = await this.createExItemBase(id);
    const argsSub$ = createBehaviorSubjectWithLifetime(base.destroy$, args);

    const expr: CallExpr = {
      ...base,
      itemType: ExItemType.Expr,
      exprType: ExprType.CallExpr,
      args$: argsSub$,
    };

    for (const arg of args) {
      arg.parent$.next(expr);
    }

    (this.ctx.eventBus.exprAdded$ as Subject<Expr>).next(expr);
    return expr;
  }

  public async createExItemBase(
    id: string
  ): Promise<ExItemBase> {
    const destroy$ = new Subject<void>();
    const project = await firstValueFrom(this.ctx.projectManager.currentProject$);
    const ordinal = await ProjectFns.getAndIncrementOrdinal(project);

    const exObjectBase: ExItemBase = {
      id,
      ordinal,
      parent$: createBehaviorSubjectWithLifetime<Parent>(destroy$, null),
      destroy$,
    };
    return exObjectBase;
  }
}
