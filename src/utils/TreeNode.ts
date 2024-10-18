export class TreeNode<T> {
  constructor(
    public value: T,
    public parent: SubscriptionRef.SubscriptionRef<TreeNode<T> | null>,
    public children: SubscriptionRef.SubscriptionRef<TreeNode<T>[]>
  ) {}

  static make<T>(
    value: T,
    children?: TreeNode<T>[]
  ): Effect.Effect<TreeNode<T>> {
    return Effect.gen(function* () {
      const result = new TreeNode(
        value,
        yield* SubscriptionRef.make<TreeNode<T> | null>(null),
        yield* SubscriptionRef.make<TreeNode<T>[]>(children ?? [])
      );

      if (children) {
        for (const child of children) {
          yield* addChild(result, child);
        }
      }

      return result;
    });
  }

  addChild = addChild;
  navigateRight = navigateRight;

  getDepth = getDepth;
  getRoot = getRoot;
  breadthTraversal = breadthTraversal;
}

import assert from "assert-ts";
import { Chunk, Effect, Option, Ref, Stream, SubscriptionRef } from "effect";

function getDepth<T>(node: TreeNode<T>): Effect.Effect<number> {
  return Effect.gen(function* () {
    const parent = yield* node.parent.get;
    if (parent === null) {
      return 0;
    }

    const parentDepth = yield* getDepth(parent);
    return 1 + parentDepth;
  });
}

function getRoot<T>(node: TreeNode<T>): Effect.Effect<TreeNode<T>> {
  return Effect.gen(function* () {
    const parent = yield* node.parent.get;
    if (parent === null) {
      return node;
    }
    return yield* getRoot(parent);
  });
}

function breadthTraversal<T>(node: TreeNode<T>): Stream.Stream<TreeNode<T>> {
  const queue = [node];
  return Stream.repeatEffectOption(
    Effect.gen(function* () {
      const current = queue.shift();
      if (current === undefined) {
        return yield* Effect.fail(Option.none());
      }
      queue.push(...(yield* current.children.get));
      return current;
    })
  );
}

function navigateRight<T>(
  node: TreeNode<T>
): Effect.Effect<TreeNode<T> | null> {
  return Effect.gen(function* () {
    const root = yield* getRoot(node);
    const depth = yield* getDepth(node);
    const nodes1 = yield* breadthTraversal(root).pipe(Stream.runCollect);
    const nodes = Chunk.toArray(nodes1);
    const index = nodes.indexOf(node);
    // get the next node at the same depth
    for (let i = index + 1; i < nodes.length; i++) {
      const next = nodes[i];
      assert(next !== undefined);
      const nextDepth = yield* getDepth(next);
      if (nextDepth === depth) {
        return next;
      }
    }
    return null;
  });
}

const addChild = <T>(parent: TreeNode<T>, child: TreeNode<T>) =>
  Effect.gen(function* () {
    yield* Ref.set(child.parent, parent);
    const children = yield* parent.children.get;
    const children2 = [...children, child];
    yield* Ref.set(parent.children, children2);
  });
