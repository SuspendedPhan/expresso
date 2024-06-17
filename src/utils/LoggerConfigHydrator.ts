import { combineLatest } from "rxjs";
import Persistence from "../persistence/Persistence";
import LoggerConfig, { MutedKey, MutedMethod, MutedTopic } from "./LoggerConfig";

export default class LoggerConfigHydrator {
  static syncToPersistence(config: LoggerConfig) {
    combineLatest([config.getMutedTopics$(), config.getMutedMethods$(), config.getMutedKeys$()]).subscribe(([mutedTopics, mutedMethods, mutedKeys]) => {
      const dehydratedConfig: DehydratedLoggerConfig = {
        mutedTopics,
        mutedMethods,
        mutedKeys,
      };
      Persistence.writeLoggerConfig(dehydratedConfig);
    });
  }
}

export interface DehydratedLoggerConfig {
    mutedTopics: MutedTopic[];
    mutedMethods: MutedMethod[];
    mutedKeys: MutedKey[];
}
