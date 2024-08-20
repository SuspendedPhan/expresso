import { firstValueFrom, ReplaySubject } from "rxjs";
import type { Expr } from "src/ex-object/ExItem";
import ExObjectFactory from "src/ex-object/ExObjectFactory";
import { createProjectContext } from "src/ex-object/Project";
import { createLibrary, type Library } from "src/library/Library";
import {
  ProjectManager
} from "src/library/LibraryProject";
import { createExObjectFocusContext } from "src/utils/focus/ExObjectFocus";
import { createFocusContext, FocusFns } from "src/utils/focus/Focus";
import { createExprCommandCtx } from "src/utils/utils/ExprCommand";
import type GoModule from "src/utils/utils/GoModule";
import { createKeyboardContext } from "src/utils/utils/Keyboard";
import { createPersistCtx } from "src/utils/utils/PersistCtx";
import { createRefactorContext } from "src/utils/utils/Refactor";
import GoBridge from "../evaluation/GoBridge";
import { MainEventBus } from "./MainEventBus";
import MainMutator from "./MainMutator";
import MainViewContext from "./MainViewContext";
import { createComponentCtx } from "src/ex-object/Component";

export interface ExprReplacement {
  oldExpr: Expr;
  newExpr: Expr;
}

export default class MainContext {
  public readonly projectManager = new ProjectManager();
  public readonly projectCtx = createProjectContext(this);
  public readonly eventBus = new MainEventBus(this);
  public readonly mutator: MainMutator;
  public readonly objectFactory = new ExObjectFactory(this);
  public readonly focusCtx = createFocusContext(this);
  public readonly exObjectFocusCtx = createExObjectFocusContext(this);
  public readonly viewCtx = new MainViewContext(this);
  public readonly goBridge: GoBridge;
  public readonly keyboardCtx = createKeyboardContext(this);
  public readonly refactorCtx = createRefactorContext(this);
  public readonly exprCommandCtx = createExprCommandCtx(this);
  public readonly persistCtx = createPersistCtx(this);
  public readonly library$ = new ReplaySubject<Library>(1);
  public readonly componentCtx = createComponentCtx(this);

  public async getLibraryProm() {
    return firstValueFrom(this.library$);
  }

  public constructor(public readonly goModule: GoModule) {
    this.goBridge = new GoBridge(goModule, this);
    this.mutator = new MainMutator(this);
    FocusFns.register(this);
    const library = createLibrary(this, {});
    this.library$.next(library);
  }
}
