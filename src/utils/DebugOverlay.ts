import { BehaviorSubject, Observable } from "rxjs";
import DebugOverlayUtils from "./DebugOverlayUtils";
import { Message } from "./Logger";

export interface FormattedMessage {
  text: string;
  message: Message;
}

export default class DebugOverlay {
  private active = new BehaviorSubject<boolean>(false);
  private query = new BehaviorSubject<string>("");

  public isActive$(): Observable<boolean> {
    return this.active;
  }

  public toggleActive() {
    this.active.next(!this.active.value);
  }

  public getFilteredMessages$(): Observable<
    FormattedMessage[]
  > {
    return DebugOverlayUtils.getFilteredMessages$(this.query);
  }

  public getQuery$(): Observable<string> {
    return this.query;
  }

  public setQuery(query: string) {
    this.query.next(query);
  }
}
