import {
  LoggerDecorator,
  type RuntimeFunctionCall
} from "./LoggerDecorator";

export default class Logger {
  private static readonly loggedThisValues = new Set<any>();

  static {
    LoggerDecorator.currentCall$.subscribe((functionCall) => {
      if (!functionCall) return;

      if (this.loggedThisValues.has(functionCall.thisValue)) {
        functionCall.astCall.currentlyLogging = true;
      }

      if (functionCall.astCall.currentlyLogging) {
        this.logFunctionCall(functionCall);
      }
    });
  }

  public static arg(name: string, value: any) {
    const currentFunctionCall = LoggerDecorator.currentCall$.value;
    if (!currentFunctionCall) {
      throw new Error("No current function call");
    }

    const sub = currentFunctionCall.argsLogged$.subscribe({
      complete: () => {
        throw new Error("Args have already been logged");
      }
    });

    currentFunctionCall.args.push({ message: `${name}: ${value}` });
    sub.unsubscribe();
  }

  public static logCallstack() {
    const currentFunctionCall = LoggerDecorator.currentCall$.value;
    if (!currentFunctionCall) {
      throw new Error("No current function call");
    }

    currentFunctionCall.astCall.currentlyLoggingCallstack = true;

    const ancestors = this.getAncestors(currentFunctionCall);
    for (const ancestor of ancestors) {
      if (ancestor.astCall.currentlyLogging) {
        continue;
      }
      ancestor.astCall.currentlyLogging = true;
    }
  }

  public static logFunction() {
    const currentFunctionCall = LoggerDecorator.currentCall$.value;
    if (!currentFunctionCall) {
      throw new Error("No current function call");
    }

    currentFunctionCall.astCall.currentlyLogging = true;
  }

  public static logClass() {
    const currentFunctionCall = LoggerDecorator.currentCall$.value;
    if (!currentFunctionCall) {
      throw new Error("No current function call");
    }

    currentFunctionCall.astCall.currentlyLogging = true;
    this.loggedThisValues.add(currentFunctionCall.thisValue);
  }

  /**
   * Used for logging closures, which don't necessarily include the parent scope in the callstack.
   * logThisCallstack should be called in the method scope - any log calls made on this logger will use the logger's
   * scope to determine if the log should be printed.
   */
  static logger() {
    const loggerCurrentCall = LoggerDecorator.currentCall$.value;
    if (!loggerCurrentCall) {
      throw new Error("No current function call");
    }

    return {
      log(name: string, ...args: any) {
        const currentCall = LoggerDecorator.currentCall$.value;
        if (currentCall) {
          currentCall.argsLogged$.complete();
        }

        const astCall = loggerCurrentCall.astCall;
        if (!astCall.currentlyLogging) {
          return;
        }

        // const argString = args
        //   .map((arg: any) => arg?.toString() ?? "null/undefined")
        //   .join(", ");
        console.log(`${astCall.id}.${name}`, ...args);
        // console.log(`${astCall.id}.${name}(${argString})`);
      },
    };
  }

  public static getAncestors(
    functionCall: RuntimeFunctionCall
  ): RuntimeFunctionCall[] {
    const ancestors = [];
    let current: RuntimeFunctionCall | null = functionCall;
    while (current) {
      ancestors.push(current);
      current = current.parent;
    }
    ancestors.reverse();
    return ancestors;
  }

  private static logFunctionCall(functionCall: RuntimeFunctionCall) {
    functionCall.argsLogged$.subscribe({
      complete: () => {
        if (functionCall.logged) {
          return;
        }

        functionCall.logged = true;

        const argString = functionCall.args
          .map((arg) => arg.message)
          .join(", ");
        console.log(
          `${functionCall.astCall.className}.${functionCall.astCall.name}(${argString})`
        );
      },
    });
  }
}
