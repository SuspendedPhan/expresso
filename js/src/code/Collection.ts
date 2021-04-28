import wu from "wu";
import Functions from "./Functions";

interface Index<T> {
  map: Map<string, T[]>;
  hasUniqueConstraint: boolean;
}

export default class Collection<T> {
  private items: T[] = [];
  private indexByField = new Map<string, Index<T>>();
  private iteratorVersion = 0;

  constructor(
    indexedFields: string[] = [],
    uniquelyIndexedFields: string[] = []
  ) {
    const setup = (fields, unique) => {
      for (const field of fields) {
        this.indexByField.set(field, {
          map: new Map<string, T[]>(),
          hasUniqueConstraint: unique,
        });
      }
    };

    setup(indexedFields, false);
    setup(uniquelyIndexedFields, true);
  }

  public *[Symbol.iterator]() {
    const iteratorVersion = this.iteratorVersion;

    for (const item of this.items) {
      console.assert(iteratorVersion === this.iteratorVersion);
      yield item;
    }
  }

  public getMany(indexedField: string, indexKey: any) {
    const index = this.indexByField.get(indexedField);
    console.assert(index !== undefined);
    const answer = index?.map.get(indexKey) ?? [];
    return answer;
  }

  public getUnique(indexedField: string, indexKey: any, shouldAssert = true) {
    console.assert(this.indexByField.get(indexedField)?.hasUniqueConstraint);
    const answer = this.getMany(indexedField, indexKey);
    if (shouldAssert) {
      console.assert(answer.length === 1);
    }
    return answer?.[0];
  }

  public add(item) {
    this.iteratorVersion++;
    this.items.push(item);
    for (const [field, index] of this.indexByField.entries()) {
      const indexKey = item[field];
      const items = index.map.get(indexKey);
      if (items === undefined) {
        index.map.set(indexKey, [item]);
      } else {
        if (index.hasUniqueConstraint) console.assert(items.length === 0);
        items.push(item);
      }
    }

    return item;
  }

  public delete(item) {
    console.assert(this.indexByField.size > 0);

    this.iteratorVersion++;
    const priorItemCount = this.items.length;
    this.items = wu(this.items)
      .reject((t) => t === item)
      .toArray();
    console.assert(this.items.length === priorItemCount - 1);

    for (const [field, index] of this.indexByField) {
      const indexKey = item[field];
      const priorItems = index.map.get(indexKey);
      console.assert(priorItems !== undefined);
      console.assert(priorItems!.length > 0);
      const postItems = wu(priorItems as T[])
        .reject((t) => t === item)
        .toArray();
      console.assert(postItems.length === priorItems!.length - 1);

      if (postItems.length === 0) {
        index.map.delete(indexKey);
      } else {
        index.map.set(indexKey, postItems);
      }
    }
  }

  public serialize() {
    return {
      items: this.items,
    };
  }

  public deserialize(serializedCollection, itemClass = undefined as any) {
    this.items = [];
    for (const index of this.indexByField.values()) {
      index.map.clear();
    }
    for (const item of serializedCollection.items) {
      if (itemClass !== undefined) {
        const deserializedItem = new itemClass();
        Object.assign(deserializedItem, item);
        this.add(deserializedItem);
      } else {
        this.add(item);
      }
    }
  }

  public get length() {
    return this.items.length;
  }
}
