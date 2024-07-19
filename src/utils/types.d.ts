declare module "deepool" {
  export function create<T>(factory: () => T): {
    use(): T;
    grow(count: number): void;
    recycle(item: T): void;
    size(): number;
  };
}
