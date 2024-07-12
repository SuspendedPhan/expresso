import { BehaviorSubject, of, ReplaySubject, tap } from "rxjs";
import { FunctionCall, FunctionCallMetadata, loggedMethod, LoggerDecorator } from "../logger/LoggerDecorator";
import Logger from "../logger/Logger";

export default function YY() {
    of("A").pipe(
        tap(LL.watch),
    );
}

class QQ {
    @loggedMethod
    static ta$() {
        return of("A").pipe(
            LL.watch(),
        );
    }
}

interface Stream {
    id: string;
    name: string;
    currentlyLogging: BehaviorSubject<boolean>;
    ancestors: Set<FunctionCallMetadata>;
}

class LL {
    private static streamMapByFunctionCallMetadataId = new Map<string, Map<string, Stream>>();
    
    static watch(name: string) {
        const currentFunctionCall = LoggerDecorator.currentFunctionCall$.value;
        if (!currentFunctionCall) { throw new Error("No current function call"); }

        const ancestors = Logger.getAncestors(currentFunctionCall).map((ancestor) => ancestor.metadata);
        const id = `${currentFunctionCall.metadata.className}.${currentFunctionCall.metadata.name}.${name}`;
        

        const metadata = this.streamMapByFunctionCallMetadataId.get(currentFunctionCall.metadata.id);
        let stream = metadata?.get(id);
        if (!stream) {
            stream = {
                id,
                name,
                currentlyLogging: new BehaviorSubject(false),
                ancestors: new Set(ancestors),
            };
        }

        return tap(() => {
            console.log("watching");
        });
    }

    static logStack() {
        // Get all streams
    }
}