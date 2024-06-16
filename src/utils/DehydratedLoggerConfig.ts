import { MutedKey, MutedMethod } from "./LoggerConfig";

export default interface DehydratedLoggerConfig {
    mutedTopics: string[];
    mutedMethods: MutedMethod[];
    mutedKeys: MutedKey[];
}
