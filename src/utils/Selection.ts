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
  private readonly downFn$: Observable<() => void>;
  private readonly upFn$: Observable<() => void>;

  public constructor(private root: Observable<Attribute>) {
    this.downFn$ = combineLatest([this.selectedObject$, this.root]).pipe(
      map(([selectedObject, root]) => {
        if (selectedObject === null) {
          return () => this.selectedObject$.next(root);
        }

        if (selectedObject.type === "Attribute") {
          return () => {
            selectedObject.expr$.pipe(take(1)).subscribe(this.selectedObject$);
          };
        }

        if (selectedObject.type === "CallExpr") {
          return () => {
            if (selectedObject.args[0] === undefined) {
              throw new Error("CallExpr must have at least 1 args");
            }
            selectedObject.args[0]
              .pipe(take(1))
              .subscribe(this.selectedObject$);
          };
        }

        if (selectedObject.type === "NumberExpr") {
            return () => {};
        }

        throw new Error("Unknown type");
      }),
      share()
    );

    this.upFn$ = combineLatest([this.selectedObject$, this.root]).pipe(
      map(([selectedObject, root]) => {
        if (selectedObject === null) {
            return () => this.selectedObject$.next(root);
        }

        if (selectedObject.type === "Attribute") {
          return () => this.selectedObject$.next(null);
        }

        selectedObject.parent$.pipe(take(1)).subscribe(this.selectedObject$);

        return () => {};
      }),
      share()
    );
  }

  public down() {
    this.downFn$.pipe(take(1)).subscribe((fn) => fn());
  }

  public up() {
    this.upFn$.pipe(take(1)).subscribe((fn) => fn());
  }
}
