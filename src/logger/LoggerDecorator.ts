import { BehaviorSubject, ReplaySubject } from "rxjs";

interface Message {
  readonly message: string;
}

export interface RuntimeFunctionCall {
  readonly astCall: AstFunctionCall;
  readonly parent: RuntimeFunctionCall | null;
  readonly args: Message[];
  readonly argsLogged$: BehaviorSubject<boolean>;
  readonly children$: ReplaySubject<RuntimeFunctionCall>;
  readonly thisValue: any;
}

export interface AstFunctionCall {
  readonly id: string;
  readonly className: string;
  readonly name: string;
  readonly runtimeCall$: BehaviorSubject<RuntimeFunctionCall | null>;
  currentlyLogging: boolean;
  currentlyLoggingCallstack: boolean;
}

export class LoggerDecorator {
  public static readonly currentCall$ =
    new BehaviorSubject<RuntimeFunctionCall | null>(null);
  public static readonly astCallById = new Map<string, AstFunctionCall>();
  public static readonly runtimeCalls$ = new ReplaySubject<RuntimeFunctionCall>();

  public static loggedMethod(
    // @ts-ignore
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    descriptor.value = function (...args: any[]) {
      console.log("loggedMethod", target);
      console.log("loggedMethod", propertyKey);
      console.log("loggedMethod", descriptor);

      const currentFunctionCall = LoggerDecorator.currentCall$.value;
      if (currentFunctionCall) {
        if (!currentFunctionCall.argsLogged$.value) {
          currentFunctionCall.argsLogged$.next(true);
        }
      }

      const parent = currentFunctionCall;
      const functionCall: RuntimeFunctionCall = LoggerDecorator.createFunctionCall(
        propertyKey,
        this,
        parent
      );

      currentFunctionCall?.children$.next(functionCall);

      LoggerDecorator.currentCall$.next(functionCall);

      const result = originalMethod.apply(this, args);

      if (!functionCall.argsLogged$.value) {
        functionCall.argsLogged$.next(true);
      }
      LoggerDecorator.currentCall$.next(parent);
      return result;
    };
    return descriptor;
  }

  public static createFunctionCall(
    propertyKey: string | symbol,
    thisValue: any,
    parent: RuntimeFunctionCall | null
  ) {
    const name = propertyKey.toString();
    const className =
      thisValue instanceof Function
        ? thisValue.name
        : thisValue.constructor.name;
    const id = `${className}.${name}`;
    let metadata = this.astCallById.get(id);
    if (!metadata) {
      metadata = {
        id: `${className}.${name}`,
        name,
        className,
        runtimeCall$: new BehaviorSubject<RuntimeFunctionCall | null>(null),
        currentlyLogging: false,
        currentlyLoggingCallstack: false,
      };
      this.astCallById.set(metadata.id, metadata);
    }

    const functionCall: RuntimeFunctionCall = {
      astCall: metadata,
      parent,
      args: [],
      children$: new ReplaySubject<RuntimeFunctionCall>(),
      argsLogged$: new BehaviorSubject(false),
      thisValue: thisValue,
    };

    metadata.runtimeCall$.next(functionCall);
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
