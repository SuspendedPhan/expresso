import { BehaviorSubject, first, Observable, of, switchAll } from "rxjs";
import {
  ExObject,
  ExObjectType,
  Expr,
  ExprType,
} from "./ExprFactory";
import { loggedMethod } from "./logger/LoggerDecorator";
import Logger from "./logger/Logger";

type ExObjectMut = BasicExObjectMut | ExprMut;

interface BasicExObjectMut {
  objectType: Exclude<ExObjectType, ExObjectType.Expr>;
  parent$$: BehaviorSubject<Observable<ExObject>>;
  object$: Observable<ExObject>;
}

interface ExprMut {
  objectType: ExObjectType.Expr;
  parent$$: BehaviorSubject<Observable<ExObject>>;
  object$: BehaviorSubject<Expr>;
}

export default class ExprManager {
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
    };

    const object$ = mut.object$ as Observable<T>;

    this.objectMutByObject.set(object, mut);
    return object$;
  }

  private createExpr$(expr: Expr): Observable<Expr> {
    const object$ = new BehaviorSubject<Expr>(expr);
    const mut: ExprMut = {
      objectType: ExObjectType.Expr,
      parent$$: new BehaviorSubject<Observable<ExObject>>(of()),
      object$,
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
    mut.object$.next(newExpr);

    if (newExpr.exprType === ExprType.CallExpr) {
      for (const arg$ of newExpr.args) {
        arg$.pipe(first()).subscribe((arg) => {
          this.setParent(arg, newExpr);
        });
      }
    }
  }

  public setParent(object: ExObject, parent: ExObject) {
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
}
