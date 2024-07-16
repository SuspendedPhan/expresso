import {
  Observable,
  ReplaySubject
} from "rxjs";
import { Attribute } from "../ExObject";
import Dehydrator from "../hydration/Dehydrator";
import Rehydrator from "../hydration/Rehydrator";
import Logger from "../logger/Logger";
import { loggedMethod } from "../logger/LoggerDecorator";
import MainContext from "../MainContext";
import Main from "./Main";

export default class HydrationTest {
  @loggedMethod
  public static test(main: Main, ctx: MainContext): Observable<Attribute> {
    const rehydratedAttribute$ = new ReplaySubject<Attribute>(1);

    const logger = Logger.logger();

    const attribute = main.attribute;
    new Dehydrator()
      .dehydrateAttribute$(attribute)
      .subscribe((dehydratedAttribute) => {
        logger.log(
          "subscribe",
          "dehydratedAttribute",
          JSON.stringify(dehydratedAttribute, null, 3)
        );
        const rehydratedAttribute = new Rehydrator(
          ctx!.objectFactory
        ).rehydrateAttribute(dehydratedAttribute);

        rehydratedAttribute$.next(rehydratedAttribute);
      });

    return rehydratedAttribute$;
  }
}
