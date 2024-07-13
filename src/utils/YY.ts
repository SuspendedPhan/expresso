import {
  BehaviorSubject,
  map,
  MonoTypeOperatorFunction,
  of,
  OperatorFunction,
  pipe,
  switchAll,
  switchMap,
  tap,
} from "rxjs";
import {
  AstFunctionCall,
  loggedMethod,
  LoggerDecorator,
} from "../logger/LoggerDecorator";
import Logger from "../logger/Logger";

export default function YY() {
  QQ.ta$().subscribe(() => {});

  // QQ.tt$.next(2);
}

class QQ {
  public static tt$ = new BehaviorSubject(1);

  @loggedMethod
  static ta$() {
    Logger.logCallstack();
    const logger: any = LL.logger();

    return this.tt$.pipe(
      map((v) => {
        logger.log("map", {
          v,
        });
        return v + 1;
      }),
      switchMap((v) => {
        logger.log("switchMap", {
          v,
        });
        return this.tb$(v);
      })
    );
  }

  @loggedMethod
  static tb$(v: number) {
    Logger.logCallstack();
    return of(v).pipe(
      map((v) => {
        return v + 2;
      }),
    );
  }
}

class LL {
  static tapLog<T>(
    name: string,
    callback: (...args: any[]) => [string, any][]
  ): MonoTypeOperatorFunction<T> {
    const currentCall = LoggerDecorator.currentCall$.value;
    if (!currentCall) {
      throw new Error("No current function call");
    }

    return tap((...args) => {
      const astCall = currentCall.astCall;
      if (!astCall.currentlyLogging) {
        return;
      }

      const tapLogArgs = callback(...args);
      const argString = tapLogArgs.map((arg) => arg.join(": ")).join(", ");
      console.log(`${astCall.id}.${name}(${argString})`);
    });
  }

  static logger() {
    const currentCall = LoggerDecorator.currentCall$.value;
    if (!currentCall) {
      throw new Error("No current function call");
    }

    return {
      log(name: string, args: any) {
        const astCall = currentCall.astCall;
        if (!astCall.currentlyLogging) {
          return;
        }

        // concat args
        const argString = Object.entries(args).map(([key, value]) => `${key}: ${value}`).join(", ");
        console.log(`${astCall.id}.${name}(${argString})`);
      },
    };
  }
}
