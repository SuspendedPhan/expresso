import { first } from "rxjs";
import { Expr } from "./ExObject";
import ExObjectFactory from "./ExObjectFactory";
import GoBridge from "./GoBridge";
import { MainEventBus } from "./main-context/MainEventBus";
import MainMutator from "./MainMutator";
import type GoModule from "./utils/GoModule";
import Selection from "./utils/Selection";

export interface ExprReplacement {
  oldExpr: Expr;
  newExpr: Expr;
}

export default class MainContext {
  public readonly eventBus = new MainEventBus();
  public readonly mutator: MainMutator;
  public readonly objectFactory = new ExObjectFactory(this);
  public readonly selection = new Selection();
  public readonly goBridge: GoBridge;

  public constructor(public readonly goModule: GoModule) {
    this.goBridge = new GoBridge(goModule, this);
    this.mutator = new MainMutator(this);

    this.eventBus.onExprReplaced$.subscribe((replacement) => {
      const oldExpr = replacement.oldExpr;
      const newExpr = replacement.newExpr;
      this.selection
        .getSelectedObject$()
        .pipe(first())
        .subscribe((selectedObject) => {
          if (selectedObject === oldExpr) {
            this.selection.select(newExpr);
          }
        });
    });
  }
}
