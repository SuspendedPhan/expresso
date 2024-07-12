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
    // @ts-ignore
    target: any, 
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;
    descriptor.value = function (...args: any[]) {
      const currentFunctionCall = LoggerDecorator.currentFunctionCall$.value;
      const parent = currentFunctionCall;
      const functionCall: FunctionCall = LoggerDecorator.createFunctionCall(
        propertyKey,
        this,
        parent
      );

      if (currentFunctionCall) {
        currentFunctionCall.children$.next(functionCall);
        if (!currentFunctionCall.argsLogged$.value) {
          currentFunctionCall.argsLogged$.next(true);
        }
      }
      LoggerDecorator.currentFunctionCall$.next(functionCall);

      const result = originalMethod.apply(this, args);
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
        id: crypto.randomUUID(),
        // id: `${className}.${name}`,
        name,
        className,
        functionCalls$: new Subject<FunctionCall>(),
        currentlyLoggingCallstack: false,
      };
      this.metadataById.set(metadata.id, metadata);
      metadata.functionCalls$.subscribe((functionCall) => {
        console.log(`CREATE FUNCTION CALL - ON FUNCTION ${functionCall.metadata.id}`);
      });
    }

    const functionCall: FunctionCall = {
      metadata,
      parent,
      args: [],
      children$: new ReplaySubject<FunctionCall>(),
      argsLogged$: new BehaviorSubject(false),
    };

    metadata.functionCalls$.next(functionCall);
    console.log(this.metadataById);
    
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
