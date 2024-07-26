import { BehaviorSubject, first, Subject } from "rxjs";
import type { Component } from "src/ex-object/Component";
import {
  type CallExpr,
  type ExItemBase,
  ExItemType,
  type Expr,
  ExprType,
  type NumberExpr,
  type Parent,
  type Project
} from "src/ex-object/ExItem";
import type { LibraryProject } from "src/library/LibraryProject";
import type MainContext from "src/main-context/MainContext";
import type { ProjectMut } from "src/mutator/ProjectMutator";
import { loggedMethod } from "src/utils/logger/LoggerDecorator";
import {
  createBehaviorSubjectWithLifetime
} from "src/utils/utils/Utils";

export default class ExObjectFactory {
  private currentOrdinal = 0;
  public constructor(private readonly ctx: MainContext) {
    this.ctx.projectManager.currentProject$.subscribe((project) => {
      // @ts-ignore
      project.currentOrdinal$.subscribe((ordinal) => {
        this.currentOrdinal = ordinal;
      });
    });
  }

  public createProject(libraryProject: LibraryProject, rootComponents: readonly Component[]): Project {
    const rootComponentsSub$ = new BehaviorSubject<readonly Component[]>(
      rootComponents
    );

    const currentOrdinalSub$ = new BehaviorSubject<number>(0);

    const project: ProjectMut = {
      libraryProject,
      rootComponents$: rootComponentsSub$,
      rootComponentsSub$,
      currentOrdinal$: currentOrdinalSub$,
      currentOrdinalSub$,
    };

    return project;
  }


  @loggedMethod
  public createNumberExpr(value?: number, id?: string): NumberExpr {
    if (id === undefined) {
      id = `expr-${crypto.randomUUID()}`;
    }

    if (value === undefined) {
      value = 0;
    }

    const base = this.createExItemBase(id);

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
  public createCallExpr(id?: string, args?: Expr[]): CallExpr {
    if (id === undefined) {
      id = `expr-${crypto.randomUUID()}`;
    }

    if (args === undefined) {
      const arg0 = this.createNumberExpr();
      const arg1 = this.createNumberExpr();
      args = [arg0, arg1];
    }

    const base = this.createExItemBase(id);
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

  public createExItemBase(
    id: string
  ): ExItemBase {
    const destroy$ = new Subject<void>();
    const exObjectBase: ExItemBase = {
      id,
      ordinal: this.currentOrdinal,
      parent$: createBehaviorSubjectWithLifetime<Parent>(destroy$, null),
      destroy$,
    };
    this.ctx.projectManager.currentProject$.pipe(first()).subscribe((project) => {
      (project as ProjectMut).currentOrdinalSub$.next(this.currentOrdinal + 1);
    });
    return exObjectBase;
  }
}
