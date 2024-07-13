import { BehaviorSubject, map, of, tap } from "rxjs";
import {
  AstFunctionCall,
  loggedMethod,
  LoggerDecorator,
} from "../logger/LoggerDecorator";
import Logger from "../logger/Logger";

export default function YY() {
  QQ.ta$().subscribe(() => {
  });
  
  QQ.tt$.next(2);
}

class QQ {
  public static tt$ = new BehaviorSubject(1);

  @loggedMethod
  static ta$() {
    Logger.logCallstack();
    return this.tt$.pipe(
      LL.tapLog("tb$", (v) => {
        const args: [string, any][] = [];
        args.push(["v", v]);
        return args;
      }),
      // LL.activate()
    );
  }

  @loggedMethod
  static tb$(v: number) {
    return of(v).pipe(
      LL.tapLog("tb$", (v) => {
        const args: [string, any][] = [];
        args.push(["v", v]);
        return args;
      }),
      LL.activate()
    );
  }
}

interface TapLog {
  id: string;
  name: string;
  scope: TapLogScope;
  currentlyLogging$: BehaviorSubject<boolean>;
}

/**
 * Contains all TapLogs for a given function call metadata.
 */
interface TapLogScope {
  astCall: AstFunctionCall;
  tapLogById: Map<string, TapLog>;
  ancestors: Set<AstFunctionCall>;
  currentlyLogging$: BehaviorSubject<boolean>;
}

class LL {
  private static readonly scopeByAstCallId = new Map<string, TapLogScope>();

  static tapLog(name: string, callback: (...args: any[]) => [string, any][]) {
    const currentCall = LoggerDecorator.currentCall$.value;
    if (!currentCall) {
      throw new Error("No current function call");
    }

    return tap((...args) => {
      const astCall = currentCall.astCall;
      if (!astCall.currentlyLogging){
        return;
      }

      const tapLogArgs = callback(...args);
      const argString = tapLogArgs.map((arg) => arg.join(": ")).join(", ");
      console.log(`${astCall.id}.${name}(${argString})`);
    });
  }

  private static addTapLog(name: string): TapLog {
    // Add scope if it doesn't exist.
    // Add TapLog if it doesn't exist.
    // When scope.currentlyLogging$ is true, all TapLogs in the scope start logging.

    const currentCall = LoggerDecorator.currentCall$.value;
    if (!currentCall) {
      throw new Error("No current function call");
    }

    const scopeId = currentCall.astCall.id;
    let scope = this.scopeByAstCallId.get(scopeId);
    if (!scope) {
      scope = {
        currentlyLogging$: new BehaviorSubject(false),
        astCall: currentCall.astCall,
        tapLogById: new Map(),
        ancestors: new Set(),
      };
      this.scopeByAstCallId.set(scopeId, scope);
    }

    const ancestors = Logger.getAncestors(currentCall);
    for (const ancestor of ancestors) {
      scope.ancestors.add(ancestor.astCall);
    }

    const tapLogId = `${currentCall.astCall.id}.${name}`;
    let tapLog = scope.tapLogById.get(tapLogId);
    if (!tapLog) {
      tapLog = {
        id: tapLogId,
        name,
        scope,
        // TODP: remove
        currentlyLogging$: new BehaviorSubject(false),
      };

      scope.tapLogById.set(tapLogId, tapLog);
    }
    return tapLog;
  }

  /**
   * Starts logging all TapLogs in the current and ancestor scopes.
   */
  static activate() {
    const currentCall = LoggerDecorator.currentCall$.value;
    if (!currentCall) {
      throw new Error("No current function call");
    }

    const scopeId = currentCall.astCall.id;
    const scope = this.scopeByAstCallId.get(scopeId);
    if (!scope) {
      throw new Error("No scope");
    }

    for (const ancestor of scope.ancestors) {
      this.startLogging(ancestor);
    }
    this.startLogging(currentCall.astCall);
    return tap();
  }

  static startLogging(ancestor: AstFunctionCall) {
    const scope = this.scopeByAstCallId.get(ancestor.id);
    if (!scope) {
      throw new Error("No scope");
    }

    if (scope.currentlyLogging$.value) {
      return;
    }

    scope.currentlyLogging$.next(true);
  }
}
