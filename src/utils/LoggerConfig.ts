import { BehaviorSubject, Observable, combineLatest, map } from "rxjs";
import { Message } from "./Logger";
import GistPersistence from "../persistence/GistPersistence";
import LoggerConfigHydrator from "./LoggerConfigHydrator";

export interface MutedTopic {
  id: string;
  topic: string;
}

export interface MutedMethod {
  id: string;
  topic: string;
  method: string;
}

export interface MutedKey {
  id: string
  topic: string;
  method: string;
  key: string;
}

export default class LoggerConfig {
  private static instance = new LoggerConfig();

  public static get(): LoggerConfig {
    return LoggerConfig.instance;
  }

  private mutedTopics = new BehaviorSubject<MutedTopic[]>([]);
  private mutedMethods = new BehaviorSubject<MutedMethod[]>([]);
  private mutedKeys = new BehaviorSubject<MutedKey[]>([]);

  private constructor() {
    this.load().then(() => {
      LoggerConfigHydrator.syncToPersistence(this);
    });
  }

  private async load() {
    const dehydratedConfig = await GistPersistence.readLoggerConfig();
    if (dehydratedConfig !== null) {
      this.mutedTopics.next(dehydratedConfig.mutedTopics);
      this.mutedMethods.next(dehydratedConfig.mutedMethods);
      this.mutedKeys.next(dehydratedConfig.mutedKeys);
    }
  }

  public getMutedTopics$(): Observable<MutedTopic[]> {
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
    if (!mutedTopics.find((mt) => mt.topic === topic)) {
      mutedTopics.push({ topic, id: crypto.randomUUID() });
      this.mutedTopics.next(mutedTopics);
    }
  }

  public unmuteTopic(topic: string) {
    const mutedTopics = this.mutedTopics.value;
    const index = mutedTopics.findIndex((mt) => mt.topic === topic);
    if (index !== -1) {
      mutedTopics.splice(index, 1);
      this.mutedTopics.next(mutedTopics);
    }
  }

  public muteMethod(topic: string, method: string) {
    const mutedMethods = this.mutedMethods.value;
    if (!mutedMethods.find((m) => m.topic === topic && m.method === method)) {
      mutedMethods.push({ topic, method, id: crypto.randomUUID() });
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
      mutedKeys.push({ topic, method, key, id: crypto.randomUUID() });
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
    mutedTopics: MutedTopic[],
    mutedMethods: MutedMethod[],
    mutedKeys: MutedKey[]
  ): boolean {
    if (mutedTopics.find((mt) => mt.topic === message.topic)) {
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
