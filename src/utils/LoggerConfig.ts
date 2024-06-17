import { BehaviorSubject, Observable, combineLatest, from, map } from "rxjs";
import Logger, { Message } from "./Logger";
import GistPersistence from "../persistence/GistPersistence";
import { DehydratedLoggerConfig } from "./LoggerConfigHydrator";

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
  private static instance: LoggerConfig | null = null;

  public static get$(): Observable<LoggerConfig> {
    return from(LoggerConfig.get());
  }

  private static async get(): Promise<LoggerConfig> {
    if (LoggerConfig.instance === null) {
      const dehydratedConfig = await GistPersistence.readLoggerConfig();
      const instance = new LoggerConfig();
      if (dehydratedConfig !== null) {
        instance.mutedTopics.next(dehydratedConfig.mutedTopics);
        instance.mutedMethods.next(dehydratedConfig.mutedMethods);
        instance.mutedKeys.next(dehydratedConfig.mutedKeys);
      }
      LoggerConfig.instance = instance;
    }
    return LoggerConfig.instance;
  }

  private mutedTopics = new BehaviorSubject<string[]>([]);
  private mutedMethods = new BehaviorSubject<MutedMethod[]>([]);
  private mutedKeys = new BehaviorSubject<MutedKey[]>([]);

  public constructor() {}

  public getMutedTopics$(): Observable<string[]> {
    return this.mutedTopics;
  }

  public getMutedMethods$(): Observable<MutedMethod[]> {
    return this.mutedMethods;
  }

  public getMutedKeys$(): Observable<MutedKey[]> {
    return this.mutedKeys;
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
    const index = mutedMethods.findIndex(
      (m) => m.topic === topic && m.method === method
    );
    if (index !== -1) {
      mutedMethods.splice(index, 1);
      this.mutedMethods.next(mutedMethods);
    }
  }

  public muteKey(topic: string, method: string, key: string) {
    const mutedKeys = this.mutedKeys.value;
    if (
      !mutedKeys.find(
        (m) => m.topic === topic && m.method === method && m.key === key
      )
    ) {
      mutedKeys.push({ topic, method, key });
      this.mutedKeys.next(mutedKeys);
    }
  }

  public unmuteKey(topic: string, method: string, key: string) {
    const mutedKeys = this.mutedKeys.value;
    const index = mutedKeys.findIndex(
      (m) => m.topic === topic && m.method === method && m.key === key
    );
    if (index !== -1) {
      mutedKeys.splice(index, 1);
      this.mutedKeys.next(mutedKeys);
    }
  }

  isMuted$(message: Message): Observable<boolean> {
    return combineLatest([
      this.mutedTopics,
      this.mutedMethods,
      this.mutedKeys,
    ]).pipe(
      map(([mutedTopics, mutedMethods, mutedKeys]) => {
        return this.isMuted(message, mutedTopics, mutedMethods, mutedKeys);
      })
    );
  }

  private isMuted(
    message: Message,
    mutedTopics: string[],
    mutedMethods: MutedMethod[],
    mutedKeys: MutedKey[]
  ): boolean {
    if (mutedTopics.includes(message.topic)) {
      return true;
    }
    if (
      mutedMethods.find(
        (mm) => mm.topic === message.topic && mm.method === message.method
      )
    ) {
      return true;
    }
    if (
      mutedKeys.find(
        (mk) =>
          mk.topic === message.topic &&
          mk.method === message.method &&
          mk.key === message.key
      )
    ) {
      return true;
    }
    return false;
  }
}
