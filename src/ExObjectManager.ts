import { BehaviorSubject, first, Observable, of, Subject, switchAll } from "rxjs";
import {
  ExObject,
  ExObjectType,
  Expr,
  ExprType,
} from "./ExObjectFactory";
import { loggedMethod } from "./logger/LoggerDecorator";
import Logger from "./logger/Logger";

type ExObjectMut = BasicExObjectMut | ExprMut;

interface ExObjectMutBase {
  parent$$: BehaviorSubject<Observable<ExObject>>;
  destroy$: Subject<ExObject>;
}

interface BasicExObjectMut extends ExObjectMutBase {
  objectType: Exclude<ExObjectType, ExObjectType.Expr>;
  object$: Observable<ExObject>;
}

interface ExprMut extends ExObjectMutBase {
  objectType: ExObjectType.Expr;
  object$: BehaviorSubject<Expr>;
}

export default class ExObjectManager {
  private readonly objectMutByObject = new Map<ExObject, ExObjectMut>();

  public getObject$(object: ExObject): Observable<ExObject> {
    const mut = this.objectMutByObject.get(object);
    if (!mut) {
      console.log(this.objectMutByObject);
      throw new Error(`object$ not found for ${object?.id}`);
    }

    return mut.object$;
  }

  @loggedMethod
  public createObject$<T extends ExObject>(object: T): Observable<T> {
    Logger.arg("expr", object.id);
    Logger.logCallstack();

    if (object.objectType === ExObjectType.Expr) {
      const object$ = this.createExpr$(object);
      return object$ as Observable<T>;
    }

    const mut: BasicExObjectMut = {
      objectType: object.objectType,
      parent$$: new BehaviorSubject<Observable<ExObject>>(of()),
      object$: new BehaviorSubject<ExObject>(object),
      destroy$: new Subject<ExObject>(),
    };

    const object$ = mut.object$ as Observable<T>;

    this.objectMutByObject.set(object, mut);

    if (object.objectType === ExObjectType.Attribute) {
      object.expr$.pipe(first()).subscribe((expr) => {
        this.setParent(expr, object);
      });
    }
    return object$;
  }

  private createExpr$(expr: Expr): Observable<Expr> {
    const object$ = new BehaviorSubject<Expr>(expr);
    const mut: ExprMut = {
      objectType: ExObjectType.Expr,
      parent$$: new BehaviorSubject<Observable<ExObject>>(of()),
      object$,
      destroy$: new Subject<ExObject>(),
    };

    this.objectMutByObject.set(expr, mut);
    return object$;
  }

  public replace(expr: Expr, newExpr: Expr) {
    const mut = this.objectMutByObject.get(expr);
    if (!mut) {
      throw new Error(`expr$ not found for ${expr}`);
    }

    if (mut.objectType !== ExObjectType.Expr) {
      throw new Error(`expr$ is not ExprMut`);
    }

    this.objectMutByObject.set(newExpr, mut);
    this.objectMutByObject.delete(expr);
    mut.destroy$.next(expr);
    mut.object$.next(newExpr);

    if (newExpr.exprType === ExprType.CallExpr) {
      for (const arg$ of newExpr.args) {
        arg$.pipe(first()).subscribe((arg) => {
          this.setParent(arg, newExpr);
        });
      }
    }
  }

  @loggedMethod
  private setParent(object: ExObject, parent: ExObject) {
    Logger.logCallstack();
    Logger.arg("object", object.id);
    const mut = this.objectMutByObject.get(object);
    if (!mut) {
      throw new Error(`expr$ not found for ${object}`);
    }

    const parentMut = this.objectMutByObject.get(parent);
    if (!parentMut) {
      throw new Error(`parent$ not found for ${parent?.id}`);
    }
    mut.parent$$.next(parentMut.object$);
  }

  public getParent$(expr: ExObject): Observable<ExObject> {
    const mut = this.objectMutByObject.get(expr);
    if (!mut) {
      throw new Error(`expr$ not found for ${expr}`);
    }
    return mut.parent$$.pipe(switchAll());
  }

  public getDestroy$(exObject: ExObject): Observable<ExObject> {
    const mut = this.objectMutByObject.get(exObject);
    if (!mut) {
      throw new Error(`destroy$ not found for ${exObject?.id}`);
    }

    return mut.destroy$;
  }
}
