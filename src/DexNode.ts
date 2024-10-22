export namespace DexNode {
  export interface DexNode<T> {
    children: T[];
  }

  export function* traverse<T extends DexNode<T>>(node: T): Generator<T, void, void> {
    yield node;
    for (const child of node.children) {
      yield* traverse(child);
    }
  }

  export function* traverseAll<T extends DexNode<T>>(nodes: T[]): Generator<T, void, void> {
    for (const node of nodes) {
      yield* traverse(node);
    }
  }
}
