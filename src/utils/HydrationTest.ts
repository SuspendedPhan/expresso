import { BehaviorSubject, Observable, of, switchAll } from "rxjs";
import Dehydrator from "../hydration/Dehydrator";
import Rehydrator from "../hydration/Rehydrator";
import Logger from "../logger/Logger";
import { loggedMethod } from "../logger/LoggerDecorator";
import MainContext from "../MainContext";
import Main from "./Main";
import { Attribute } from "../ExprFactory";

export default class HydrationTest {
  @loggedMethod
  public static test(main: Main, ctx: MainContext): Observable<Attribute> {
    const rehydratedAttribute$$ = new BehaviorSubject<Observable<Attribute>>(
      of()
    );

    const logger = Logger.logger();
    main.attribute$.subscribe((attribute) => {
      new Dehydrator()
        .dehydrateAttribute$(attribute)
        .subscribe((dehydratedAttribute) => {
          logger.log(
            "subscribe",
            "dehydratedAttribute",
            JSON.stringify(dehydratedAttribute, null, 3)
          );
          const rehydratedAttribute = new Rehydrator(
            ctx!.exprFactory
          ).rehydrateAttribute(dehydratedAttribute);

          const attr$ = ctx.exprManager.createObject$(rehydratedAttribute);
          rehydratedAttribute$$.next(attr$);
        });
    });

    return rehydratedAttribute$$.pipe(switchAll());
  }
}
