import {
  FunctionCall,
  FunctionCallMetadata,
  LoggerDecorator,
} from "./LoggerDecorator";

export default class Logger {
  public static arg(name: string, value: any) {
    const currentFunctionCall = LoggerDecorator.currentFunctionCall$.value;
    if (!currentFunctionCall) {
      throw new Error("No current function call");
    }
    if (currentFunctionCall.argsLogged$.value) {
      throw new Error("Args already logged");
    }

    currentFunctionCall.args.push({ message: `${name}: ${value}` });
  }
  public static logCallstack() {
    if (!LoggerDecorator.currentFunctionCall$.value) {
      throw new Error("No current function call");
    }
    const ancestors = this.getAncestors(
      LoggerDecorator.currentFunctionCall$.value
    );
    for (const ancestor of ancestors) {
      if (ancestor.metadata.currentlyLogging) {
        continue;
      }
      ancestor.metadata.currentlyLogging = true;
      this.startLoggingFunctionCalls(ancestor.metadata);
    }
  }

  private static getAncestors(functionCall: FunctionCall): FunctionCall[] {
    const ancestors = [];
    let current: FunctionCall | null = functionCall;
    while (current) {
      ancestors.push(current);
      current = current.parent;
    }
    ancestors.reverse();
    return ancestors;
  }

  private static startLoggingFunctionCalls(metadata: FunctionCallMetadata) {
    metadata.functionCall$.subscribe((functionCall) => {
      if (!functionCall) return;
      this.logFunctionCall(functionCall);
    });
  }

  private static logFunctionCall(functionCall: FunctionCall) {
    functionCall.argsLogged$.subscribe((argsLogged) => {
      if (!argsLogged) return;
      const argString = functionCall.args.map((arg) => arg.message).join(", ");
      console.log(
        `${functionCall.metadata.className}.${functionCall.metadata.name}(${argString})`
      );
    });
  }
}
