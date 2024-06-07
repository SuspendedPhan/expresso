// const ALLOWED_TOPICS: string[] | `ALL` = `ALL`;

import type { Expr } from "./Domain";

const NONE = `None`;

const ALLOW_TOPICS: string[] | `ALL` = [`Debug`];
// const ALLOW_TOPICS: string[] | `ALL` = `ALL`
const DENY_TOPICS: string[] = [NONE];

export default class Logger {
  
  private constructor(private topic: string | null) {}

  public log(...args) {
    if (DENY_TOPICS.includes(this.topic)) {
      return;
    }

    const all = ALLOW_TOPICS === `ALL`;
    const allow = all || ALLOW_TOPICS.includes(this.topic);
    if (allow) {
      console.log(this.topic, ...args);
    }
  }

  public debug(...args) {
    console.log(this.topic, ...args);
  }

  static topic(topic: string) {
    return new Logger(topic);
  }

  static log(...args) {
    new Logger(NONE).log(...args);
  }

  static debug(...args) {
    console.log(...args);
  }

  static allow(topic: string) {
    if (ALLOW_TOPICS.includes(topic)) return;
    if (ALLOW_TOPICS === `ALL`) return;
    
    ALLOW_TOPICS.push(topic);
  }
}
