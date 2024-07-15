// const ALLOWED_TOPICS: string[] | `ALL` = `ALL`;

import { BehaviorSubject, Observable } from "rxjs";

const NONE = `None`;

// let ALLOW_TOPICS: string[] | `ALL` = [`Debug`];
let ALLOW_TOPICS: string[] | `ALL` = `ALL`;
const DENY_TOPICS: string[] = [NONE];

let logToConsole = false;

export interface Message {
  id: string;
  topic: string;
  method: string;
  key: string;
  args: any[];
}

export default class BakLogger {
  private static messages$: BehaviorSubject<Message[]> = new BehaviorSubject<
    Message[]
  >([]);

  private constructor(
    private topic: string,
    private methodVar: string = `NONE`,
  ) {
  }

  public log(key: string, ...args: any[]) {
    if (DENY_TOPICS.includes(this.topic)) {
      return;
    }

    const all = ALLOW_TOPICS === `ALL`;
    const allow = all || ALLOW_TOPICS.includes(this.topic);
    if (allow) {
      BakLogger.messages$.value.push({
        id: crypto.randomUUID(),
        topic: this.topic,
        method: this.methodVar,
        args,
        key,
      });
      BakLogger.messages$.next(BakLogger.messages$.value);
      if (logToConsole) {
        console.log(this.topic, key, ...args);
      }
    }
  }

  public method(method: string): BakLogger {
    return new BakLogger(this.topic, method);
  }

  public allow() {
    if (ALLOW_TOPICS.includes(this.topic)) return;
    if (ALLOW_TOPICS === `ALL`) return;

    ALLOW_TOPICS.push(this.topic);
  }

  static file(file: string) {
    return new BakLogger(file);
  }

  static log(key: string, ...args: any[]) {
    new BakLogger(NONE).log(key, ...args);
  }

  static getMessages$(): Observable<Message[]> {
    return BakLogger.messages$;
  }

  static allow(topic: string) {
    if (ALLOW_TOPICS.includes(topic)) return;
    if (ALLOW_TOPICS === `ALL`) return;

    ALLOW_TOPICS.push(topic);
  }

  static allowAll() {
    ALLOW_TOPICS = `ALL`;
  }

  static logToConsole() {
    logToConsole = true;
  }
  static onlyAllow(topic: string) {
    ALLOW_TOPICS = [topic];
  }

  static onlyAllowTopics(topics: string[]) {
    ALLOW_TOPICS = topics;
  }
}

declare var window: any;
window.Logger = BakLogger;
