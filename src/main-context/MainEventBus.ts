import { ReplaySubject, Subject, switchMap } from "rxjs";
import type { Expr } from "src/ex-object/ExItem";
import type { ExObject } from "src/ex-object/ExObject";
import type { Property } from "src/ex-object/Property";
import type MainContext from "src/main-context/MainContext";
import type { ExprReplacement } from "src/main-context/MainContext";
import { log5 } from "src/utils/utils/Log3";
import type { OBS } from "src/utils/utils/Utils";

const log55 = log5("MainEventBus.ts");

export class MainEventBus {
  public readonly rootObjects$: OBS<readonly ExObject[]>;

  public readonly propertyAdded$ = new ReplaySubject<Property>(10);
  public readonly objectAdded$ = new ReplaySubject<ExObject>(10);
  public readonly exprAdded$ = new ReplaySubject<Expr>(10);
  public readonly exprReplaced$ = new Subject<ExprReplacement>();
  public readonly submitExprReplaceCommand$ = new Subject<void>();

  public constructor(ctx: MainContext) {
    this.rootObjects$ = ctx.projectManager.currentLibraryProject$.pipe(
      log55.tapDebug("MainEventBus rootObjects$"),
      switchMap((project) => project.project$),
      switchMap((project) => project.rootExObjects$)
    );
    this.propertyAdded$.subscribe((property) => {
      log55.debug("MainEventBus propertyAdded$", property.id);
      // this.propertyAdded$.next(property);
    });
  }
}
