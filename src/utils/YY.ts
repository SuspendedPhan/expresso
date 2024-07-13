import {
  BehaviorSubject,
  map,
  MonoTypeOperatorFunction,
  of,
  switchMap,
  tap,
} from "rxjs";
import { loggedMethod, LoggerDecorator } from "../logger/LoggerDecorator";
import Logger from "../logger/Logger";

export default function YY() {
  QQ.ta$().subscribe(() => {});
}

class QQ {
  public static tt$ = new BehaviorSubject(1);

  @loggedMethod
  static ta$() {
    Logger.logCallstack();
    const logger = Logger.logger();

    return this.tt$.pipe(
      map((v) => {
        logger.log("map", v);
        return v + 1;
      }),
      switchMap((v) => {
        logger.log("switchMap", v);
        return this.tb$(v);
      }),
      tap((v) => {
        logger.log("tap", v);
      })
    );
  }

  @loggedMethod
  static tb$(v: number) {
    Logger.logCallstack();
    return of(v).pipe(
      map((v) => {
        return v + 2;
      })
    );
  }
}
