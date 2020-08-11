import Vue from "vue";

export default class NodeActions {
  static replace(oldNode, newNode) {
    const root = oldNode.parent.children ?? oldNode.parent;
    for (const key in root) {
      if (root[key] === oldNode) {
        Vue.set(root, key, newNode);
      }
    }
  }
}
