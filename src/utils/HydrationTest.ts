import { BehaviorSubject, Observable } from "rxjs";
import Dehydrator from "../hydration/Dehydrator";
import Rehydrator from "../hydration/Rehydrator";
import Logger from "../logger/Logger";
import { loggedMethod } from "../logger/LoggerDecorator";
import MainContext from "../MainContext";
import Main from "./Main";
import { Attribute } from "../ExprFactory";

export default class HydrationTest {
  @loggedMethod
  public static test(main: Main, ctx: MainContext): Observable<Attribute|null> {
    const rehydratedAttribute$ = new BehaviorSubject<Attribute | null>(null);
    const logger = Logger.logger();
    new Dehydrator()
      .dehydrateAttribute$(main.attribute)
      .subscribe((dehydratedAttribute) => {
        logger.log(
          "subscribe",
          "dehydratedAttribute",
          JSON.stringify(dehydratedAttribute, null, 3)
        );
        const rehydratedAttribute = new Rehydrator(
          ctx!.exprFactory
        ).rehydrateAttribute(dehydratedAttribute);
        rehydratedAttribute$.next(rehydratedAttribute);
      });
    return rehydratedAttribute$;
  }
}
