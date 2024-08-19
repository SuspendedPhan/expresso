import { Subject, switchMap } from "rxjs";
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
import { createFocusContext, FocusFns } from "src/utils/utils/Focus";
import type GoModule from "src/utils/utils/GoModule";
import { createKeyboardContext } from "src/utils/utils/Keyboard";
import GoBridge from "../evaluation/GoBridge";
import { MainEventBus } from "./MainEventBus";
import MainMutator from "./MainMutator";
import MainViewContext from "./MainViewContext";
import { createExObjectFocusContext } from "src/utils/focus/ExObjectFocus";

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
  public readonly focusCtx = createFocusContext(this);
  public readonly exObjectFocusCtx = createExObjectFocusContext(this);
  public readonly viewCtx = new MainViewContext(this);
  public readonly goBridge: GoBridge;
  public readonly keyboardCtx = createKeyboardContext(this);

  public constructor(public readonly goModule: GoModule) {
    this.goBridge = new GoBridge(goModule, this);
    this.mutator = new MainMutator(this);
    FocusFns.register(this);

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
