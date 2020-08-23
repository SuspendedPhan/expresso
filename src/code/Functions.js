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

  static filterProps(obj, ...props) {
    const answer = {};
    for (const prop of props) {
      answer[prop] = obj[prop];
    }
    return answer;
  }
}