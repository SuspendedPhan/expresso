import {
  BehaviorSubject,
  Observable,
  combineLatest,
  map,
  share,
  take,
} from "rxjs";
import Logger from "./Logger";
import { Attribute, Expr } from "../ExprFactory";

export type Selectable = Attribute | Expr | null;

const logger = Logger.file("Selection.ts");
logger.allow();

export default class Selection {
  public readonly selectedObject$ = new BehaviorSubject<Selectable>(null);
  public readonly root$ = new BehaviorSubject<Selectable>(null);

  public down() {
    combineLatest([this.selectedObject$, this.root$]).pipe(take(1)).subscribe(([selectedObject, root]) => {
      console.log("down", selectedObject, root);
      
      if (selectedObject === null) {
        this.selectedObject$.next(root);
        return;
      }

      if (selectedObject.type === "Attribute") {
        selectedObject.expr$.pipe(take(1)).subscribe(this.selectedObject$);
        return;
      }

      if (selectedObject.type === "CallExpr") {
        if (selectedObject.args[0] === undefined) {
          throw new Error("CallExpr must have at least 1 args");
        }
        selectedObject.args[0].pipe(take(1)).subscribe(this.selectedObject$);
        return;
      }

      if (selectedObject.type === "NumberExpr") {
        return;
      }

      throw new Error("Unknown type");
    });
  }

  public up() {
    combineLatest([this.selectedObject$, this.root$]).pipe(take(1)).subscribe(([selectedObject, root]) => {
      if (selectedObject === null) {
        return root;
      }

      if (selectedObject.type === "Attribute") {
        return;
      }

      if (selectedObject.type === "CallExpr" || selectedObject.type === "NumberExpr") {
        selectedObject.parent$.pipe(take(1)).subscribe(this.selectedObject$);
        return;
      }

      throw new Error("Unknown type");
    });
  }
}
