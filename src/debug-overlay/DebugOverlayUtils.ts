import { Observable, combineLatest, map } from "rxjs";
import Logger, { Message } from "../utils/Logger";
import { FormattedMessage } from "./DebugOverlay";

export default class DebugOverlayUtils {
  public static formatMessage(m: Message): FormattedMessage {
    // Concat all the args.

    const args = m.args
      .map((a) => {
        if (a === null) {
          return "null";
        }
        return a.toString();
      })
      .join(" ");
    return {
      text: `${m.topic} ${m.key} ${args}`,
      message: m,
    };
  }

  public static getFilteredMessages$(
    query$: Observable<string>
  ): Observable<FormattedMessage[]> {
    const formattedMessages$ = Logger.getMessages$().pipe(
      map((messages) => {
        // Format all the messages and join them with a newline.
        return messages.map(DebugOverlayUtils.formatMessage);
      })
    );

    const filteredMessages$ = combineLatest([formattedMessages$, query$]).pipe(
      map(([formattedMessages, query]) => {
        // Filter the messages based on the query.
        if (query === "") {
          return formattedMessages;
        }

        return formattedMessages.filter((m) =>
          m.text.toLowerCase().includes(query.toLowerCase())
        );
      })
    );
    return filteredMessages$;
  }
}
