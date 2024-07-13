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
        LL.arg("v", v);
      }),
      LL.activate()
    );
  }
}

interface TapLog {
  id: string;
  name: string;
}

/**
 * Contains all TapLogs for a given function call metadata.
 */
interface TapLogScope {
  id: string;
  currentlyLogging: BehaviorSubject<boolean>;
  functionCallMetadata: AstFunctionCall;
  ancestors: Set<AstFunctionCall>;
}

class LL {
  private static streamMapByFunctionCallMetadataId = new Map<
    string,
    Map<string, TapLog>
  >();

  static tapLog(name: string, callback: (...args: any[]) => void) {
    const currentFunctionCall = LoggerDecorator.currentCall$.value;
    if (!currentFunctionCall) {
      throw new Error("No current function call");
    }

    const ancestors = Logger.getAncestors(currentFunctionCall).map(
      (ancestor) => ancestor.astCall
    );
    const id = `${currentFunctionCall.astCall.className}.${currentFunctionCall.astCall.name}.${name}`;

    const metadata = this.streamMapByFunctionCallMetadataId.get(
      currentFunctionCall.astCall.id
    );
    let stream = metadata?.get(id);
    if (!stream) {
      stream = {
        id,
        name,
        currentlyLogging: new BehaviorSubject(false),
        ancestors: new Set(ancestors),
      };
    }

    return tap((...args) => {
      callback(...args);
      console.log("watching");
    });
  }

  static arg(name: string, value: any) {}

  /**
   *
   */
  static activate() {
    /*
     */

    return tap();
  }
}
