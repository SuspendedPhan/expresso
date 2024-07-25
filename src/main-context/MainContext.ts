import { first, Subject, switchMap } from "rxjs";
import type { Expr, Project } from "src/ex-object/ExObject";
import ExObjectFactory from "src/ex-object/ExObjectFactory";
import ComponentMutator from "src/mutator/ComponentMutator";
import ProjectMutator from "src/mutator/ProjectMutator";
import Rehydrator from "src/utils/hydration/Rehydrator";
import Persistence from "src/utils/persistence/Persistence";
import type GoModule from "src/utils/utils/GoModule";
import GoBridge from "../evaluation/GoBridge";
import FocusManager from "../utils/utils/FocusManager";
import { MainEventBus } from "./MainEventBus";
import MainMutator from "./MainMutator";
import Dehydrator from "src/utils/hydration/Dehydrator";
import MainViewContext from "./MainViewContext";

export interface ExprReplacement {
  oldExpr: Expr;
  newExpr: Expr;
}

export default class MainContext {
  public readonly eventBus = new MainEventBus();
  public readonly mutator: MainMutator;
  public readonly projectMutator = new ProjectMutator(this);
  public readonly componentMutator = new ComponentMutator(this);
  public readonly objectFactory = new ExObjectFactory(this);
  public readonly focusManager = new FocusManager();
  public readonly viewCtx = new MainViewContext(this);
  public readonly goBridge: GoBridge;

  public constructor(public readonly goModule: GoModule) {
    this.goBridge = new GoBridge(goModule, this);
    this.mutator = new MainMutator(this);

    this.eventBus.onExprReplaced$.subscribe((replacement) => {
      const oldExpr = replacement.oldExpr;
      const newExpr = replacement.newExpr;
      this.focusManager
        .getFocus$()
        .pipe(first())
        .subscribe((focus) => {
          if (focus.type !== "ExObject") {
            return;
          }
          if (focus.exObject === oldExpr) {
            this.focusManager.focus({ type: "ExObject", exObject: newExpr });
          }
        });
    });

    Persistence.readProject$.subscribe((deProject) => {
      if (deProject === null) {
        this.objectFactory.createProjectNew();
      } else {
        const project = new Rehydrator(this).rehydrateProject(deProject);
        (this.eventBus.currentProject$ as Subject<Project>).next(project);
      }
    });

    const dehydrator = new Dehydrator();
    this.eventBus.currentProject$.pipe(
      switchMap((project) => dehydrator.dehydrateProject$(project))
    ).subscribe((deProject) => {
      Persistence.writeProject(deProject);
    });
  }
}
