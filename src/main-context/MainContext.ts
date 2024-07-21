import { first, Subject } from "rxjs";
import type { Expr, Project } from "src/ex-object/ExObject";
import ExObjectFactory from "src/ex-object/ExObjectFactory";
import GoBridge from "../evaluation/GoBridge";
import { MainEventBus } from "./MainEventBus";
import MainMutator from "./MainMutator";
import type GoModule from "src/utils/utils/GoModule";
import Selection from "../utils/utils/Selection";
import ComponentMutator from "src/mutator/ComponentMutator";
import Persistence from "src/utils/persistence/Persistence";
import Rehydrator from "src/utils/hydration/Rehydrator";

export interface ExprReplacement {
  oldExpr: Expr;
  newExpr: Expr;
}

export default class MainContext {
  public readonly eventBus = new MainEventBus();
  public readonly mutator: MainMutator;
  public readonly componentMutator = new ComponentMutator(this);
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

    this.eventBus.rootComponents$.subscribe((rootComponents) => {
      const rootComponent = rootComponents[0];
      this.selection.root$.next(rootComponent ?? null);
    });

    Persistence.readProject$.subscribe((deProject) => {
      const project = new Rehydrator(this).rehydrateProject(deProject);
      (this.eventBus.project$ as Subject<Project>).next(project);
    });
  }
}
