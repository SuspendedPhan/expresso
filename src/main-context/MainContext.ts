import type { Expr } from "src/ex-object/ExItem";
import ExObjectFactory from "src/ex-object/ExObjectFactory";
import { createProjectContext } from "src/ex-object/Project";
import {
  ProjectManager
} from "src/library/LibraryProject";
import ProjectMutator from "src/mutator/ProjectMutator";
import { createExObjectFocusContext } from "src/utils/focus/ExObjectFocus";
import { createExprCommandCtx } from "src/utils/utils/ExprCommand";
import { createFocusContext, FocusFns } from "src/utils/utils/Focus";
import type GoModule from "src/utils/utils/GoModule";
import { createKeyboardContext } from "src/utils/utils/Keyboard";
import { createPersistCtx } from "src/utils/utils/PersistCtx";
import { createRefactorContext } from "src/utils/utils/Refactor";
import GoBridge from "../evaluation/GoBridge";
import { MainEventBus } from "./MainEventBus";
import MainMutator from "./MainMutator";
import MainViewContext from "./MainViewContext";

export interface ExprReplacement {
  oldExpr: Expr;
  newExpr: Expr;
}

export default class MainContext {
  public readonly projectManager = new ProjectManager(this);
  public readonly projectCtx = createProjectContext(this);
  public readonly eventBus = new MainEventBus(this);
  public readonly mutator: MainMutator;
  public readonly projectMutator = new ProjectMutator(this);
  public readonly objectFactory = new ExObjectFactory(this);
  public readonly focusCtx = createFocusContext(this);
  public readonly exObjectFocusCtx = createExObjectFocusContext(this);
  public readonly viewCtx = new MainViewContext(this);
  public readonly goBridge: GoBridge;
  public readonly keyboardCtx = createKeyboardContext(this);
  public readonly refactorCtx = createRefactorContext(this);
  public readonly exprCommandCtx = createExprCommandCtx(this);
  public readonly persistCtx = createPersistCtx(this);

  public constructor(public readonly goModule: GoModule) {
    this.goBridge = new GoBridge(goModule, this);
    this.mutator = new MainMutator(this);
    FocusFns.register(this);
  }
}
