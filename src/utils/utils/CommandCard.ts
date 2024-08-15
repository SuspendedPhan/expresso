import { BehaviorSubject } from "rxjs";
import type MainContext from "src/main-context/MainContext";
import type { OBS } from "src/utils/utils/Utils";

export interface CommandCardData {
  title: string;
  commands: string[];
  visible$: OBS<boolean>;
}

export type CommandCardContext = ReturnType<typeof createCommandCardContext>;

export function createCommandCardContext(_ctx: MainContext) {
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
}