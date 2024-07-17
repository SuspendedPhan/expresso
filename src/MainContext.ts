import type GoModule from "./utils/GoModule";
import Selection from "./utils/Selection";
import GoBridge from "./GoBridge";
import MainMutator from "./MainMutator";
import ExObjectFactory from "./ExObjectFactory";
import { first, Subject } from "rxjs";
import { Attribute, Expr } from "./ExObject";
import { OBS } from "./utils/Utils";

export default class MainContext {
  private readonly onAttributeAdded$_ = new Subject<Attribute>();
  private readonly onExprAdded$_ = new Subject<Expr>();
  
  public readonly onAttributeAdded$: OBS<Attribute> = this.onAttributeAdded$_;
  public readonly onExprAdded$: OBS<Expr> = this.onExprAdded$_;

  public readonly mutator: MainMutator;
  public readonly objectFactory = new ExObjectFactory(this);
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
