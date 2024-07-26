import { BehaviorSubject, first, Subject } from "rxjs";
import {
  type CallExpr,
  type Component,
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
import type {
  CallExprMut,
  ExItemMut,
  ExItemMutBase
} from "../main-context/MainMutator";

export default class ExObjectFactory {
  private currentOrdinal = 0;
  public constructor(private readonly ctx: MainContext) {
    this.ctx.projectManager.currentProject$.subscribe((project) => {
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

    const mutBase = this.createExObjectBaseMut();
    const base = this.createExObjectBase(mutBase, id);

    const expr: NumberExpr & ExItemMut = {
      objectType: ExItemType.Expr,
      exprType: ExprType.NumberExpr,
      value,
      ...base,
      ...mutBase,
    };

    (this.ctx.eventBus.onExprAdded$ as Subject<Expr>).next(expr);
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

    const mutBase = this.createExObjectBaseMut();
    const base = this.createExObjectBase(mutBase, id);
    const argsSub$ = createBehaviorSubjectWithLifetime(base.destroy$, args);

    const expr: CallExprMut = {
      ...base,
      ...mutBase,
      objectType: ExItemType.Expr,
      exprType: ExprType.CallExpr,
      args$: argsSub$,
      argsSub$,
    };

    for (const arg of args) {
      const argMut = arg as ExItemMut;
      argMut.parentSub$.next(expr);
    }

    (this.ctx.eventBus.onExprAdded$ as Subject<Expr>).next(expr);
    return expr;
  }

  public createExObjectBaseMut(): ExItemMutBase {
    const destroySub$ = new Subject<void>();
    const parentSub$ = createBehaviorSubjectWithLifetime<Parent>(
      destroySub$,
      null
    );

    return {
      parentSub$,
      destroySub$,
    };
  }

  public createExObjectBase(
    mutBase: ExItemMutBase,
    id: string
  ): ExItemBase {
    const exObjectBase = {
      id,
      ordinal: this.currentOrdinal,
      parent$: mutBase.parentSub$,
      destroy$: mutBase.destroySub$,
    };
    this.ctx.projectManager.currentProject$.pipe(first()).subscribe((project) => {
      (project as ProjectMut).currentOrdinalSub$.next(this.currentOrdinal + 1);
    });
    return exObjectBase;
  }
}
