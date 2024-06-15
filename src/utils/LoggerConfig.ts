export interface MutedMethod {
    topic: string;
    method: string;
}

export interface MutedKey {
    topic: string;
    method: string;
    key: string;
}

export default interface LoggerConfig {
    mutedTopics: string[];
    mutedMethods: MutedMethod[];
    mutedKeys: MutedKey[];
}