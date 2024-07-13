import { BehaviorSubject, of, ReplaySubject, tap } from "rxjs";
import {
  RuntimeFunctionCall,
  AstFunctionCall,
  loggedMethod,
  LoggerDecorator,
} from "../logger/LoggerDecorator";
import Logger from "../logger/Logger";

export default function YY() {
  of("A").pipe(tap(LL.watch));
}

class QQ {
  @loggedMethod
  static ta$() {
    return of("A").pipe(
      LL.tapLog("ta$", (v) => {
        const args = [];
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

  static tapLog(name: string, callback: (...args: any[]) => [][]) {
    const tapLog = this.addTapLog(name);
    return tap((...args) => {
      const tapLogArgs = callback(...args);
      if (tapLog.scope.currentlyLogging$.value) {
        console.log(`${tapLog.id}`);
      }
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
        // TODP: remove
        currentlyLogging$: new BehaviorSubject(false),
      };

      scope.tapLogById.set(tapLogId, tapLog);
    }
  }

  static arg(name: string, value: any) {}

  /**
   * Starts logging all TapLogs in the current and ancestor scopes.
   */
  static activate() {
    return tap();
  }
}
