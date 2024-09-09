import { Context, Effect, Layer } from "effect";
import { BehaviorSubject } from "rxjs";
import type { OBS } from "src/utils/utils/Utils";

export interface CommandCardData {
  title: string;
  commands: string[];
  visible$: OBS<boolean>;
}

export class CommandCardCtx extends Context.Tag("CommandCardCtx")<
  CommandCardCtx,
  Effect.Effect.Success<typeof ctxEffect>
>() {}

const ctxEffect = Effect.gen(function* () {
  const props = {
    commandCards$: new BehaviorSubject<CommandCardData[]>([]),
  };
  
  return {
    ...props,
    
    async addCommandCard(data: CommandCardData) {
      const { commandCards$ } = props;
      const commandCards = commandCards$.value;
      commandCards.push(data);
      commandCards$.next(commandCards);
    },
  };
});

export const CommandCardCtxLive = Layer.effect(
  CommandCardCtx,
  ctxEffect
);

