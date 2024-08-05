import { first, Subject, switchMap } from "rxjs";
import ExObjectFactory from "src/ex-object/ExObjectFactory";
import {
  type LibraryProject,
  ProjectManager,
} from "src/library/LibraryProject";
import ProjectMutator from "src/mutator/ProjectMutator";
import Dehydrator from "src/utils/hydration/Dehydrator";
import Rehydrator from "src/utils/hydration/Rehydrator";
import Persistence from "src/utils/persistence/Persistence";
import type GoModule from "src/utils/utils/GoModule";
import GoBridge from "../evaluation/GoBridge";
import FocusManager from "../utils/utils/FocusManager";
import { MainEventBus } from "./MainEventBus";
import MainMutator from "./MainMutator";
import MainViewContext from "./MainViewContext";
import type { Expr } from "src/ex-object/ExItem";

export interface ExprReplacement {
  oldExpr: Expr;
  newExpr: Expr;
}

export default class MainContext {
  public readonly projectManager = new ProjectManager(this);
  public readonly eventBus = new MainEventBus(this);
  public readonly mutator: MainMutator;
  public readonly projectMutator = new ProjectMutator(this);
  public readonly objectFactory = new ExObjectFactory(this);
  public readonly focusManager = new FocusManager(this);
  public readonly viewCtx = new MainViewContext(this);
  public readonly goBridge: GoBridge;

  public constructor(public readonly goModule: GoModule) {
    this.goBridge = new GoBridge(goModule, this);
    this.mutator = new MainMutator(this);

    this.eventBus.exprReplaced$.subscribe((replacement) => {
      const oldExpr = replacement.oldExpr;
      const newExpr = replacement.newExpr;
      this.focusManager
        .getFocus$()
        .pipe(first())
        .subscribe((focus) => {
          if (focus.type !== "ExItem") {
            return;
          }

          if (focus.exItem === oldExpr) {
            this.focusManager.focusExItem(newExpr);
          }
        });
    });

    // Persistence.readProject$.subscribe(async (deProject) => {
    //   if (deProject === null) {
    //     this.projectManager.addProjectNew();
    //   } else {
    //     const project = await new Rehydrator(this).rehydrateProject(deProject);
    //     (
    //       this.projectManager.currentLibraryProject$ as Subject<LibraryProject>
    //     ).next(project);
    //   }
    // });

    const dehydrator = new Dehydrator();
    this.projectManager.currentProject$
      .pipe(switchMap((project) => dehydrator.dehydrateProject$(project)))
      .subscribe((deProject) => {
        Persistence.writeProject(deProject);
      });
  }
}
