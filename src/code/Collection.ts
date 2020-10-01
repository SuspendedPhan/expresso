import wu from "wu";

interface Index<T> {
  map: Map<string, T[]>;
  hasUniqueConstraint: boolean;
}

export default class Collection<T> {
  private items: T[] = [];
  private indexByField = new Map<string, Index<T>>();
  private activeIterators = 0;

  constructor(indexedFields: string[] = [], uniquelyIndexedFields: string[] = []) {
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

  public *[Symbol.iterator] () {
    this.activeIterators++;
    for (const item of this.items) {
      yield item;
    }
    this.activeIterators--;
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
    console.assert(this.activeIterators === 0);
    this.items.push(item);
    for (const [field, index] of this.indexByField.entries()) {
      const indexKey = item[field];
      const items = index.map.get(indexKey);
      if (items === undefined) {
        index.map.set(indexKey, [item]);
      } else {
        if (index.hasUniqueConstraint) console.assert(items.length === 1);
        items.push(item);
      }
    }

    return item;
  }

  public delete(item) {
    console.assert(this.activeIterators === 0);
    console.assert(this.indexByField.size > 0);
    const indexedField = this.indexByField.keys().next().value;
    const priorItemCount = this.items.length;
    this.items = wu(this.items).reject(t => t[indexedField] === item[indexedField]).toArray();
    console.assert(this.items.length === priorItemCount - 1);

    for (const [field, index] of this.indexByField) {
      const indexKey = item[field];
      const priorItems = index.map.get(indexKey);
      console.assert(priorItems !== undefined);
      console.assert(priorItems!.length > 0);
      const postItems = wu(priorItems as any).reject(t => t === item).toArray();
      console.assert(postItems.length === priorItems!.length - 1);

      if (postItems.length === 0) {
        index.map.delete(indexKey);
      }
    }
  }

  public serialize() {
    return {
      items: this.items,
    };
  }

  public deserialize(serializedCollection) {
    this.items = []
    for (const index of this.indexByField.values()) {
      index.map.clear();
    }
    for (const item of serializedCollection.items) {
      this.add(item);
    }
  }

  public get length() {
    return this.items.length;
  }
}
