export default class Functions {
  static topDown(node, action) {
    action(node);
    for (const child of node.children ?? []) {
      this.topDown(child, action);
    }
  }
}