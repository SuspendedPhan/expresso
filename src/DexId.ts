import { HashMap } from "effect";
import type { Brand } from "effect/Brand";

export namespace DexId {
  interface Identifiable<in out K extends string | symbol> {
    id: Brand<K>;
  }

  export function make<T extends string>(): T {
    return crypto.randomUUID() as T;
  }

  export function makeValueByIdMap<T extends string, V extends Identifiable<T>>(items: V[]): HashMap.HashMap<Brand<T>, V> {
    return HashMap.make(
      ...items.map((i) => {
        return [i.id, i] as [Brand<T>, V];
      })
    );
  }
}
