import wu from 'wu';

export default class Functions {
  static topDown(node, action) {
    action(node);
    for (const child of node.children ?? []) {
      this.topDown(child, action);
    }
  }

  static * ancestors(store, node) {
    const parentByNode = store.parentByNode;
    var ancestor = parentByNode.get(node);
    while (ancestor != null) {
      yield ancestor;
      ancestor = parentByNode.get(ancestor);
    }
  }

  // does not yield the node
  static * traverseLeft(node, parentGetter, childrenGetter) {
    const reversedChildrenGetter = (node) => {
      return Array.from(childrenGetter(node)).reverse();
    }
    const parent = parentGetter(node);
    if (parent == null) return;

    let seenNode = false;
    for (const child of reversedChildrenGetter(parent)) {
      if (seenNode) {
        yield * Functions.traversePostOrder(child, reversedChildrenGetter);
      }
      if (child === node) {
        seenNode = true;
      }
    }
    yield parent;
    yield * Functions.traverseLeft(parent, parentGetter, childrenGetter);
  }

  // does not yield the node
  static * traverseRight(node, parentGetter, childrenGetter) {
    // yield my children
    for (const child of childrenGetter(node)) {
      yield * Functions.traversePreOrder(child, childrenGetter);
    }
    
    let visitNode = node;
    while (true) {
      const parent = parentGetter(visitNode);
      if (parent == null) return;

      const children = wu(childrenGetter(parent))
        .dropWhile(child => child !== visitNode)
        .drop(1);
      for (const child of children) {
        yield * Functions.traversePreOrder(child, childrenGetter);
      }
      visitNode = parent;
    }
  }

  static * traversePreOrder(node, childrenGetter) {
    yield node;
    for (const child of childrenGetter(node)) {
      yield * Functions.traversePreOrder(child);
    }
  }

  // yields the node
  static * traversePostOrder(node, childrenGetter) {
    for (const child of childrenGetter(node)) {
      yield * this.traversePostOrder(child, childrenGetter);
    }
    yield node;
  }

  static filterProps(obj, ...props) {
    const answer = {};
    for (const prop of props) {
      answer[prop] = obj[prop];
    }
    return answer;
  }
}