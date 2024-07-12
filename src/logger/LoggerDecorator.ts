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
  readonly functionCall$: BehaviorSubject<FunctionCall | null>;
  currentlyLogging: boolean;
}

export class LoggerDecorator {
  public static readonly currentFunctionCall$ =
    new BehaviorSubject<FunctionCall | null>(null);
  public static readonly metadataById = new Map<string, FunctionCallMetadata>();
  public static readonly functionCalls$ = new ReplaySubject<FunctionCall>();

  public static loggedMethod(
    // @ts-ignore
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    descriptor.value = function (...args: any[]) {
      const currentFunctionCall = LoggerDecorator.currentFunctionCall$.value;
      if (currentFunctionCall) {
        if (!currentFunctionCall.argsLogged$.value) {
          currentFunctionCall.argsLogged$.next(true);
        }
      }

      const parent = currentFunctionCall;
      const functionCall: FunctionCall = LoggerDecorator.createFunctionCall(
        propertyKey,
        this,
        parent
      );

      currentFunctionCall?.children$.next(functionCall);

      LoggerDecorator.currentFunctionCall$.next(functionCall);

      const result = originalMethod.apply(this, args);

      if (!functionCall.argsLogged$.value) {
        functionCall.argsLogged$.next(true);
      }
      LoggerDecorator.currentFunctionCall$.next(parent);
      return result;
    };
    return descriptor;
  }

  public static createFunctionCall(
    propertyKey: string | symbol,
    thisValue: any,
    parent: FunctionCall | null
  ) {
    const name = propertyKey.toString();
    const className =
      thisValue instanceof Function
        ? thisValue.name
        : thisValue.constructor.name;
    const id = `${className}.${name}`;
    let metadata = this.metadataById.get(id);
    if (!metadata) {
      metadata = {
        id: `${className}.${name}`,
        name,
        className,
        functionCall$: new BehaviorSubject<FunctionCall | null>(null),
        currentlyLogging: false,
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

    metadata.functionCall$.next(functionCall);
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
