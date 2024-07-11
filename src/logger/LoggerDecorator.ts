import { BehaviorSubject, Observable, ReplaySubject, Subject } from "rxjs";

interface Message {
  readonly message: string;
}

export interface FunctionCall {
  readonly metadata: FunctionCallMetadata;
  readonly parent: FunctionCall | null;
  readonly args: Message[];
  readonly argsLogged$: BehaviorSubject<boolean>;
  readonly children$: ReplaySubject<FunctionCall>;
}

export interface FunctionCallMetadata {
  readonly id: string;
  readonly className: string;
  readonly name: string;
  readonly functionCalls$: Subject<FunctionCall>;
  currentlyLoggingCallstack: boolean;
}

export class LoggerDecorator {
  public static readonly currentFunctionCall$ =
    new BehaviorSubject<FunctionCall | null>(null);
  public static readonly metadataById = new Map<string, FunctionCallMetadata>();

  public static loggedMethod(
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    descriptor.value = (...args: any[]) => {
      const currentFunctionCall = this.currentFunctionCall$.value;
      const parent = currentFunctionCall;
      const functionCall: FunctionCall = this.createFunctionCall(
        propertyKey,
        target,
        parent
      );
  
      if (currentFunctionCall) {
        currentFunctionCall.children$.next(functionCall);
        if (!currentFunctionCall.argsLogged$.value) {
          currentFunctionCall.argsLogged$.next(true);
        }
      }
      this.currentFunctionCall$.next(functionCall);
  
      const result = originalMethod.apply(this, args);
      this.currentFunctionCall$.next(parent);
      return result;
    };
    return descriptor;
  }

  public static createFunctionCall(
    propertyKey: string | symbol,
    target: any,
    parent: FunctionCall | null
  ) {
    const name = propertyKey.toString();
    const className =
      target instanceof Function ? target.name : target.constructor.name;
    console.log("loggedMethod", name);
  
    const id = `${className}.${name}`;
    let metadata = this.metadataById.get(id);
    if (!metadata) {
      metadata = {
        id: `${className}.${name}`,
        name,
        className,
        functionCalls$: new Subject<FunctionCall>(),
        currentlyLoggingCallstack: false,
      };
      this.metadataById.set(metadata.id, metadata);
    }
  
    const functionCall: FunctionCall = {
      metadata,
      parent,
      args: [],
      children$: new ReplaySubject<FunctionCall>(),
      argsLogged$: new BehaviorSubject(false),
    };

    metadata.functionCalls$.next(functionCall);
    return functionCall;
  }
  
}

export function loggedMethod(
  target: any,
  propertyKey: string | symbol,
  descriptor: PropertyDescriptor
) {
  return LoggerDecorator.loggedMethod(target, propertyKey, descriptor);
}