declare module "deepool" {
  export function create<T>(factory: () => T): {
    use(): T;
    grow(count: number): void;
    recycle(item: T): void;
    size(): number;
  };
}

/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY: string
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
