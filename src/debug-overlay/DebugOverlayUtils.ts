import { Observable, combineLatest, map, switchMap } from "rxjs";
import Logger, { Message } from "../utils/Logger";
import { FormattedMessage } from "./DebugOverlay";
import LoggerConfig from "../utils/LoggerConfig";

export default class DebugOverlayUtils {
  public static formatMessage(m: Message): FormattedMessage {
    // Concat all the args.

    const args = m.args
      .map((a) => {
        if (a === null) {
          return "null";
        }
        return a;
        // return a.toString();
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

        const queryFilteredMessages = formattedMessages.filter((m) =>
          m.text.toLowerCase().includes(query.toLowerCase())
        );
        return queryFilteredMessages;
      }),
      switchMap((messages) => DebugOverlayUtils.excludeMutedMessages(messages))
    );
    return filteredMessages$;
  }
  static excludeMutedMessages(messages: FormattedMessage[]): Observable<FormattedMessage[]> {
    const loggerConfig = LoggerConfig.get();
    const messagesWithMuted$ = DebugOverlayUtils.getMessagesWithMuted$(messages, loggerConfig);

    return combineLatest(messagesWithMuted$).pipe(
      map((mutedMessages) => {
        return mutedMessages.filter((m) => !m.muted).map((m) => m.fm);
      })
    );
  }

  private static getMessagesWithMuted$(messages: FormattedMessage[], loggerConfig: LoggerConfig) {
    return messages.map((fm) => {
      const muted$ = loggerConfig.isMuted$(fm.message);
      return muted$.pipe(map((muted) => ({ fm, muted })));
    });
  }
}
