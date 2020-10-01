import wu from "wu";

type Index<T> = Map<string, T>;

export default class Collection<T> {
  private items: T[] = [];
  private indexByField = new Map<string, Index<T>>();
  private activeIterators = 0;

  constructor(indexedFields: string[]) {
    for (const field of indexedFields) {
      this.indexByField.set(field, new Map<string, T>());
    }
  }

  public *[Symbol.iterator] () {
    this.activeIterators++;
    for (const item of this.items) {
      yield item;
    }
    this.activeIterators--;
  }

  public getFrom(indexedField: string, indexKey: any, shouldAssert = true) {
    const index = this.indexByField.get(indexedField);
    console.assert(index !== undefined);
    const answer = index?.get(indexKey);
    if (shouldAssert) {
      console.assert(answer !== undefined);
    } 
    return answer;
  }

  public add(item) {
    console.assert(this.activeIterators === 0);
    this.items.push(item);
    for (const [field, index] of this.indexByField.entries()) {
      const indexKey = item[field];
      console.assert(!index.has(indexKey));
      index.set(indexKey, item);
    }

    return item;
  }

  public delete(item) {
    console.assert(this.activeIterators === 0);
    console.assert(this.indexByField.size > 0);
    const indexedField = this.indexByField.keys().next().value;
    const priorItemCount = this.items.length;
    this.items = wu(this.items).reject(t => t[indexedField] === item.indexedField).toArray();
    console.assert(this.items.length === priorItemCount - 1);

    for (const [field, index] of this.indexByField) {
      const priorIndexSize = index.size;
      index.delete(item[field]);
      console.assert(index.size === priorIndexSize - 1);
    }
  }

  public get length() {
    return this.items.length;
  }
}
