import { HashMap } from "effect";
import type { Brand } from "effect/Brand";

export namespace DexId {
  interface Identifiable<in out K extends string | symbol, B extends Brand<K>> {
    id: B;
  }

  export function make<T extends string>(): T {
    return crypto.randomUUID() as T;
  }

  export function makeValueByIdMap<K extends string | symbol, V extends Identifiable<K, Brand<K>>>(
    items: (V extends Identifiable<K, Brand<K>> ? V : never)[]
  ): HashMap.HashMap<Brand<K>, V> {
    return HashMap.make(
      ...items.map((i) => {
        return [i.id, i] as [Brand<K>, V];
      })
    );
  }
}
