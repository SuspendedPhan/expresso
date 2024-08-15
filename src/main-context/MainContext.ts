import { first, Subject, switchMap } from "rxjs";
import type { Expr } from "src/ex-object/ExItem";
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
import { FocusScopeFuncs } from "src/utils/utils/FocusScope";

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
  public readonly focusScopeCtx = FocusScopeFuncs.create(this);

  public constructor(public readonly goModule: GoModule) {
    this.goBridge = new GoBridge(goModule, this);
    this.mutator = new MainMutator(this);

    this.eventBus.exprReplaced$.subscribe((replacement) => {
      // @ts-ignore
      const oldExpr = replacement.oldExpr;
      // @ts-ignore
      const newExpr = replacement.newExpr;
      this.focusManager
        .getFocus$()
        .pipe(first())
        .subscribe((focus) => {
          if (focus.type !== "Focus2") {
            return;
          }

          console.error("fix this");
        });
    });

    Persistence.readProject$.subscribe(async (deProject) => {
      // if (deProject === null) {
      if (true) {
        this.projectManager.addProjectNew();
      } else {
        // @ts-ignore
        const project = await new Rehydrator(this).rehydrateProject(deProject);
        (
          this.projectManager.currentLibraryProject$ as Subject<LibraryProject>
        ).next(project);
      }
    });

    return;
    const dehydrator = new Dehydrator();
    this.projectManager.currentProject$
      .pipe(switchMap((project) => dehydrator.dehydrateProject$(project)))
      .subscribe((deProject) => {
        Persistence.writeProject(deProject);
      });
  }
}
