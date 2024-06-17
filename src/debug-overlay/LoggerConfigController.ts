import { Observable, combineLatest, map } from "rxjs";
import LoggerConfig, { MutedKey, MutedMethod, MutedTopic } from "../utils/LoggerConfig";
import ArrayNavigator from "./ArrayNavigator";

type MuteConfig = MutedTopic | MutedMethod | MutedKey;

export default class LoggerConfigController {
  private navigator = new ArrayNavigator<MuteConfig>(LoggerConfigController.getMuteConfigs$(), (a, b) => {
    return a.id === b.id;
  });
  public constructor() {
  }

  private static getMuteConfigs$() : Observable<MuteConfig[]> {
    const topics$ = LoggerConfig.get().getMutedTopics$();
    const methods$ = LoggerConfig.get().getMutedMethods$();
    const keys$ = LoggerConfig.get().getMutedKeys$();

    return combineLatest([topics$, methods$, keys$]).pipe(map(
      ([topics, methods, keys]) => {
        const ss = [];
        for (const topic of topics) {
          ss.push(topic);
        }

        for (const method of methods) {
          ss.push(method);
        }

        for (const key of keys) {
          ss.push(key);
        }

        return ss;
      }
    ));
  }
}
