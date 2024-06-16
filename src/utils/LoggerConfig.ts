import { BehaviorSubject, Observable } from "rxjs";

export interface MutedMethod {
    topic: string;
    method: string;
}

export interface MutedKey {
    topic: string;
    method: string;
    key: string;
}

export default class LoggerConfig {
    private mutedTopics = new BehaviorSubject<string[]>([]);
    private mutedMethods = new BehaviorSubject<MutedMethod[]>([]);
    private mutedKeys = new BehaviorSubject<MutedKey[]>([]);

    public getMutedTopics$(): Observable<string[]> {
        return this.mutedTopics;
    }

    public getMutedMethods$(): Observable<MutedMethod[]> {
        return this.mutedMethods;
    }

    public getMutedKeys$(): Observable<MutedKey[]> {
        return this.mutedKeys
    }

    public muteTopic(topic: string) {
        const mutedTopics = this.mutedTopics.value;
        if (!mutedTopics.includes(topic)) {
            mutedTopics.push(topic);
            this.mutedTopics.next(mutedTopics);
        }
    }

    public unmuteTopic(topic: string) {
        const mutedTopics = this.mutedTopics.value;
        const index = mutedTopics.indexOf(topic);
        if (index !== -1) {
            mutedTopics.splice(index, 1);
            this.mutedTopics.next(mutedTopics);
        }
    }

    public muteMethod(topic: string, method: string) {
        const mutedMethods = this.mutedMethods.value;
        if (!mutedMethods.find((m) => m.topic === topic && m.method === method)) {
            mutedMethods.push({ topic, method });
            this.mutedMethods.next(mutedMethods);
        }
    }

    public unmuteMethod(topic: string, method: string) {
        const mutedMethods = this.mutedMethods.value;
        const index = mutedMethods.findIndex((m) => m.topic === topic && m.method === method);
        if (index !== -1) {
            mutedMethods.splice(index, 1);
            this.mutedMethods.next(mutedMethods);
        }
    }
    
    public muteKey(topic: string, method: string, key: string) {
        const mutedKeys = this.mutedKeys.value;
        if (!mutedKeys.find((m) => m.topic === topic && m.method === method && m.key === key)) {
            mutedKeys.push({ topic, method, key });
            this.mutedKeys.next(mutedKeys);
        }
    }

    public unmuteKey(topic: string, method: string, key: string) {
        const mutedKeys = this.mutedKeys.value;
        const index = mutedKeys.findIndex((m) => m.topic === topic && m.method === method && m.key === key);
        if (index !== -1) {
            mutedKeys.splice(index, 1);
            this.mutedKeys.next(mutedKeys);
        }
    }
}
