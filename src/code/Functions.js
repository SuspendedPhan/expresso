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

  // yields the node
  static * traversePostOrder(node, childrenGetter) {
    for (const child of childrenGetter(node)) {
      yield * traversePostOrder(child, childrenGetter);
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