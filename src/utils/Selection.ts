import { BehaviorSubject, Observable, of, take } from "rxjs";
import Logger from "./Logger";
import { Attribute, Expr } from "../ExprFactory";
import ExprManager from "../ExprManager";

export type Selectable = Attribute | Expr | null;

const logger = Logger.file("Selection.ts");
logger.allow();

export default class Selection {
  private readonly selectedObject$$ = new BehaviorSubject<Observable<Selectable>>(of());
  public readonly root$ = new BehaviorSubject<Selectable>(null);
  public constructor(private exprManager: ExprManager) {}

  public select(object: Selectable) {
    const object$ = this.exprManager.getObject$(object);
    this.selectedObject$$.next(object$);
  }

  public down() {
    const selectedObject = this.selectedObject$.value;
    const root = this.root$.value;

    if (selectedObject === null) {
      this.selectedObject$.next(root);
      return;
    }

    if (selectedObject.type === "Attribute") {
      selectedObject.expr$.pipe(take(1)).subscribe((expr) => {
        this.selectedObject$.next(expr);
      });
      return;
    }

    if (selectedObject.type === "CallExpr") {
      if (selectedObject.args[0] === undefined) {
        throw new Error("CallExpr must have at least 1 args");
      }
      selectedObject.args[0].pipe(take(1)).subscribe((arg) => {
        this.selectedObject$.next(arg);
      });
      return;
    }

    if (selectedObject.type === "NumberExpr") {
      return;
    }

    throw new Error("Unknown type");
  }

  public up() {
    const selectedObject = this.selectedObject$.value;
    if (selectedObject === null) {
      return;
    }

    if (selectedObject.type === "Attribute") {
      return;
    }

    if (
      selectedObject.type === "CallExpr" ||
      selectedObject.type === "NumberExpr"
    ) {
      selectedObject.parent$.pipe(take(1)).subscribe((parent) => {
        this.selectedObject$.next(parent);
      });
      return;
    }

    throw new Error("Unknown type");
  }
}
