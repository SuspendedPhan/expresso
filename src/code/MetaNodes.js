export class MetaNode {
  constructor() {
    this.name = this.constructor.name;
  }
  static eval(node) {
    return MetaNodesByName.get(node.name).eval(node);
  }

  make(parent, ...params) {
    console.assert(parent);
    const node = {};
    node.name = this.name;
    node.parent = parent;
    if (Array.isArray(params[0])) {
      this.onMake(node, params[0]);
    } else {
      this.onMake(node, params);
    }
    return node;
  }
}

export const MetaNodeList = [
  new class Add extends MetaNode {
    eval(node) { return MetaNode.eval(node.children[0]) + MetaNode.eval(node.children[1]) }
    onMake(node, [a, b]) {
      node.children = [MetaNodes.Number.make(node, a), MetaNodes.Number.make(node, b)]
    }
  },
  new class Number extends MetaNode {
    eval(node) { return node.value }
    onMake(node, [value]) {
      node.value = value ?? 0;
    }
  }
];

export const MetaNodesByName = new Map();
for (const metaNode of MetaNodeList) {
  MetaNodesByName.set(metaNode.name, metaNode);
}

const MetaNodes = {};
for (const metaNode of MetaNodeList) {
  MetaNodes[metaNode.name] = metaNode;
}

export default MetaNodes;
window.MetaNodes = MetaNodes;
window.MetaNodesByName = MetaNodesByName;
window.MetaNodeList = MetaNodeList;
