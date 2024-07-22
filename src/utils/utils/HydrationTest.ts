// @ts-nocheck

import { type Observable, ReplaySubject } from "rxjs";
import type { Attribute } from "src/ex-object/ExObject";
import Dehydrator from "src/utils/hydration/Dehydrator";
import Rehydrator from "src/utils/hydration/Rehydrator";
import Logger from "src/utils/logger/Logger";
import { loggedMethod } from "src/utils/logger/LoggerDecorator";
import type MainContext from "src/main-context/MainContext";
import type Main from "./Main";

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
        const rehydratedAttribute = new Rehydrator(ctx).rehydrateSceneAttribute(
          dehydratedAttribute
        );

        rehydratedAttribute$.next(rehydratedAttribute);
      });

    return rehydratedAttribute$;
  }
}
