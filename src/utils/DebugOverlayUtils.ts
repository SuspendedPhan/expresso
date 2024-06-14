import { Observable, combineLatest, map } from "rxjs";
import Logger, { Message } from "./Logger";

export default class DebugOverlayUtils {
  public static formatMessage(m: Message): string {
    // Concat all the args.

    const args = m.args
      .map((a) => {
        if (a === null) {
          return "null";
        }
        return a.toString();
      })
      .join(" ");
    return `${m.topic} ${m.key} ${args}`;
  }

  public static getFilteredMessages$(query$: Observable<string>): Observable<string[]> {
    const messages$ = Logger.getMessages$().pipe(
        map((messages) => {
          // Format all the messages and join them with a newline.
          return messages.map(DebugOverlayUtils.formatMessage);
        })
      );
    
      const filteredMessages$ = combineLatest([messages$, query$]).pipe(
        map(([messages, query]) => {
          // Filter the messages based on the query.
          if (query === "") {
            return messages;
          }
    
          return messages.filter((m) =>
            m.toLowerCase().includes(query.toLowerCase())
          );
        })
      );
      return filteredMessages$;
  }
}
