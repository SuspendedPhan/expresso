export default class Functions {
  static topDown(node, action) {
    action(node);
    for (const child of node.children ?? []) {
      this.topDown(child, action);
    }
  }

  static * ancestors(store, node) {
    const parentByNode = store.parentByNode;
    while (true) {
      var parent = parentByNode.get(node);
      if (parent == null) break;
      yield parent;
    }
  }

  static filterProps(obj, ...props) {
    const answer = {};
    for (const prop of props) {
      answer[prop] = obj[prop];
    }
    return answer;
  }
}