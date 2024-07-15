import { loggedMethod } from "../logger/LoggerDecorator";
import Logger from "../logger/Logger";

export default function TT() {
  QQ.ta();
  QQ.ta();
  console.log("");
}

class QQ {
  @loggedMethod
  public static ta() {
    Logger.arg("arg0", Math.random());
    Logger.arg("arg1", Math.random());
    this.tb(true);
    this.tb(false);
    this.tb(true);
  }

  @loggedMethod
  static tb(b: boolean) {
    Logger.arg("b", b);
    if (b) {
      this.tc();
    } else {
      this.td();
    }
  }

  @loggedMethod
  static tc() {}

  @loggedMethod
  static td() {
  }
}
