import { HashMap } from "effect";
import type { Brand } from "effect/Brand";

export namespace DexId {
  interface Identifiable<K extends Brand<string>> {
    id: K;
  }

  export function make<T extends string>(): T {
    return crypto.randomUUID() as T;
  }

  export function makeValueByIdMap<K extends Brand<any>, V>(
    items: (V extends Identifiable<K> ? V : never)[]
  ): HashMap.HashMap<K, V> {
    return HashMap.make(
      ...items.map((i) => {
        return [i.id, i] as [K, V];
      })
    );
  }
}
