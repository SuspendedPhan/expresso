import { BehaviorSubject, first, Observable, of, switchAll } from "rxjs";
import { Attribute, ExObject } from "./ExprFactory";
import { loggedMethod } from "./logger/LoggerDecorator";
import Logger from "./logger/Logger";

interface ExObjectMut {
  parent$$: BehaviorSubject<Observable<ExObject>>;
  object$: BehaviorSubject<ExObject>;
}

export default class ExprManager {
  private readonly objectMutByObject = new Map<ExObject, ExObjectMut>();

  public getObject$(object: ExObject): Observable<ExObject> {
    const mut = this.objectMutByObject.get(object);
    if (!mut) {
      throw new Error(`object$ not found for ${object?.id}`);
    }

    return mut.object$;
  }

  public createAttribute$(attribute: Attribute): Observable<ExObject> {
    const attribute$ = new BehaviorSubject<ExObject>(attribute);
    const mut: ExObjectMut = {
      parent$$: new BehaviorSubject<Observable<ExObject>>(of()),
      object$: attribute$,
    };
    this.objectMutByObject.set(attribute, mut);
    attribute.expr$.subscribe((expr) => {
        this.setParent(expr, attribute);
    });
    return attribute$;
  }

  @loggedMethod
  public createObject$(expr: ExObject): Observable<ExObject> {
    Logger.logCallstack();
    Logger.arg("expr", expr.id);
    const mut: ExObjectMut = {
      parent$$: new BehaviorSubject<Observable<ExObject>>(of()),
      object$: new BehaviorSubject<ExObject>(expr),
    };

    this.objectMutByObject.set(expr, mut);
    return mut.object$;
  }

  public replace(expr: ExObject, newExpr: ExObject) {
    const mut = this.objectMutByObject.get(expr);
    if (!mut) {
      throw new Error(`expr$ not found for ${expr}`);
    }
    this.objectMutByObject.set(newExpr, mut);
    this.objectMutByObject.delete(expr);
    mut.object$.next(newExpr);

    if (newExpr.type === "CallExpr") {
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
