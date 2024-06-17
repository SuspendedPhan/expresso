import { MutedKey, MutedMethod } from "./LoggerConfig";

export default class LoggerConfigHydrator {
    
}

export interface DehydratedLoggerConfig {
    mutedTopics: string[];
    mutedMethods: MutedMethod[];
    mutedKeys: MutedKey[];
}
