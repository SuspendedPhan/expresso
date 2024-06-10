// const ALLOWED_TOPICS: string[] | `ALL` = `ALL`;

import { BehaviorSubject, type Observable } from "rxjs";
import type { Expr } from "./Domain";

const NONE = `None`;

let ALLOW_TOPICS: string[] | `ALL` = [`Debug`];
// const ALLOW_TOPICS: string[] | `ALL` = `ALL`
const DENY_TOPICS: string[] = [NONE];

export interface Message {
  topic: string;
  args: any[];
}

export default class Logger {
  
  private static messages$: BehaviorSubject<Message[]> = new BehaviorSubject([]);
  
  private constructor(private topic: string | null) {}

  public log(...args) {
    if (DENY_TOPICS.includes(this.topic)) {
      return;
    }

    const all = ALLOW_TOPICS === `ALL`;
    const allow = all || ALLOW_TOPICS.includes(this.topic);
    if (allow) {
      console.log(this.topic, ...args);
      Logger.messages$.value.push({ topic: this.topic, args });
      Logger.messages$.next(Logger.messages$.value);
    }
  }

  public debug(...args) {
    console.log(this.topic, ...args);
    Logger.messages$.value.push({ topic: this.topic, args });
    Logger.messages$.next(Logger.messages$.value);
  }

  static topic(topic: string) {
    return new Logger(topic);
  }

  static log(...args) {
    new Logger(NONE).log(...args);
  }

  static debug(...args) {
    new Logger(NONE).debug(...args);
  }

  static getMessages$(): Observable<Message[]> {
    return Logger.messages$;
  }

  static allow(topic: string) {
    if (ALLOW_TOPICS.includes(topic)) return;
    if (ALLOW_TOPICS === `ALL`) return;
    
    ALLOW_TOPICS.push(topic);
  }

  static allowAll() {
    ALLOW_TOPICS = `ALL`;
  }
}
