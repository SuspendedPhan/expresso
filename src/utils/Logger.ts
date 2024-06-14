// const ALLOWED_TOPICS: string[] | `ALL` = `ALL`;

import { BehaviorSubject, type Observable } from "rxjs";
import type { Expr } from "../Domain";

const NONE = `None`;

let ALLOW_TOPICS: string[] | `ALL` = [`Debug`];
// const ALLOW_TOPICS: string[] | `ALL` = `ALL`
const DENY_TOPICS: string[] = [NONE];

let logToConsole = false;

export interface Message {
  topic: string;
  method: string | null;
  args: any[];
}

export default class Logger {
  private static messages$: BehaviorSubject<Message[]> = new BehaviorSubject<Message[]>([]);
  
  private constructor(private topic: string, private methodVar: string | null = null) {}

  public log(...args) {
    if (DENY_TOPICS.includes(this.topic)) {
      return;
    }

    const all = ALLOW_TOPICS === `ALL`;
    const allow = all || ALLOW_TOPICS.includes(this.topic);
    if (allow) {
      Logger.messages$.value.push({ topic: this.topic, method: this.methodVar, args });
      Logger.messages$.next(Logger.messages$.value);
      if (logToConsole) {
        console.log(this.topic, ...args);
      }
    }
  }

  public debug(...args) {
    // console.log(this.topic, ...args);
    Logger.messages$.value.push({ topic: this.topic, method: this.methodVar, args });
    Logger.messages$.next(Logger.messages$.value);
  }

  public method(method: string): Logger {
    return new Logger(this.topic, method);
  }

  public allow() {
    if (ALLOW_TOPICS.includes(this.topic)) return;
    if (ALLOW_TOPICS === `ALL`) return;
    
    ALLOW_TOPICS.push(this.topic);
  }

  static file(file: string) {
    return new Logger(file);
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

window.Logger = Logger;