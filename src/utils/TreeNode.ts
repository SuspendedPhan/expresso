import assert from "assert-ts";

export class TreeNode<T> {
  constructor(public value: T, children?: T[]) {
    if (children !== undefined) {
      for (const child of children) {
        this.addChild(new TreeNode(child));
      }
    }
  }

  parent: TreeNode<T> | null = null;
  children: TreeNode<T>[] = [];

  addChild(child: TreeNode<T>): void {
    this.children.push(child);
    child.parent = this;
  }

  navigateRight = navigateRight;

  getDepth = getDepth;
  getRoot = getRoot;
  breadthTraversal = breadthTraversal;
}

function getDepth<T>(node: TreeNode<T>): number {
  if (node.parent === null) {
    return 0;
  }

  return 1 + getDepth(node.parent);
}

function getRoot<T>(node: TreeNode<T>): TreeNode<T> {
  if (node.parent === null) {
    return node;
  }

  return getRoot(node.parent);
}

function* breadthTraversal<T>(node: TreeNode<T>): Generator<TreeNode<T>> {
  const queue = [node];
  while (true) {
    const current = queue.shift();
    if (current === undefined) {
      break;
    }
    yield current;
    queue.push(...current.children);
  }
}

function navigateRight<T>(node: TreeNode<T>): TreeNode<T> | null {
  const root = getRoot(node);
  const depth = getDepth(node);
  const nodes = Array.from(breadthTraversal(root));
  const index = nodes.indexOf(node);

  // get the next node at the same depth
  for (let i = index + 1; i < nodes.length; i++) {
    const next = nodes[i];
    assert(next !== undefined);
    if (getDepth(next) === depth) {
      return next;
    }
  }
  return null;
}
