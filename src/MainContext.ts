import type GoModule from "./utils/GoModule";
import Selection from "./utils/Selection";
import GoBridge from "./GoBridge";
import MainMutator from "./MainMutator";
import ExObjectFactory from "./ExObjectFactory";
import { first } from "rxjs";

export default class MainContext {
  public readonly mutator: MainMutator;
  public readonly objectFactory = new ExObjectFactory();
  public readonly selection = new Selection();
  public readonly goBridge: GoBridge;

  public constructor(public readonly goModule: GoModule) {
    this.goBridge = new GoBridge(goModule, this);
    this.mutator = new MainMutator(this);

    this.mutator.onExprReplaced$.subscribe((replacement) => {
      const oldExpr = replacement.oldExpr;
      const newExpr = replacement.newExpr;
      this.selection.getSelectedObject$().pipe(first()).subscribe((selectedObject) => {
        if (selectedObject === oldExpr) {
          this.selection.select(newExpr);
        }
      });
    });
  }
}
