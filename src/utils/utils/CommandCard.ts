import { BehaviorSubject, firstValueFrom } from "rxjs";
import type MainContext from "src/main-context/MainContext";
import type { OBS, SUB } from "src/utils/utils/Utils";

export interface CommandCardContext {
  commandCards$: SUB<CommandCardData[]>;
}

export interface CommandCardData {
  title: string;
  commands: string[];
  visible$: OBS<boolean>;
}

export namespace CommandCardFns {
  export function createContext(_ctx: MainContext): CommandCardContext {
    return {
      commandCards$: new BehaviorSubject<CommandCardData[]>([]),
    };
  }

  export async function add(ctx: MainContext, data: CommandCardData) {
    console.log("add", data);
    const ccCtx = ctx.viewCtx.commandCardCtx;
    const commandCards = await firstValueFrom(ccCtx.commandCards$);
    console.log("commandCards", commandCards);
    commandCards.push(data);
    ccCtx.commandCards$.next(commandCards);
  }
}
