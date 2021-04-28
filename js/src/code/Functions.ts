import wu from 'wu';
import { v4 as uuidv4 } from "uuid";

export default class Functions {
  static uuid() {
    return uuidv4();
  }

  static toJson(obj) {
    return JSON.stringify(obj, null, 2);
  }

  static pluck(obj, properties) {
    const answer = {};
    for (const property of properties) {
      if (!(property in obj)) throw new Error(`${obj} doesn't have ${property}`);
      answer[property] = obj[property];
    }
    return answer;
  }

  // static * allNodes(store) {
  //   const circle = Gets.entity(store, 'circle');
  //   for (const property of wu.values(Gets.properties(circle))) {
  //     yield * Functions.topDown(property);
  //   }
  // }

  // static * topDown(node) {
  //   yield node;
  //   for (const child of node.children ?? []) {
  //     yield * this.topDown(child);
  //   }
  // }

  // static * ancestors(store, node) {
  //   var ancestor = Gets.parentForNode(store, node);
  //   while (ancestor != null) {
  //     yield ancestor;
  //     ancestor = Gets.parentForNode(store, ancestor);
  //   }
  // }

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
      yield * Functions.traversePreOrder(child, childrenGetter);
    }
  }

  // yields the node
  static * traversePostOrder(node, childrenGetter) {
    for (const child of childrenGetter(node)) {
      yield * this.traversePostOrder(child, childrenGetter);
    }
    yield node;
  }

  // ------------------------------------------------------------

  static filterProps(obj, ...props) {
    const answer = {};
    for (const prop of props) {
      answer[prop] = obj[prop];
    }
    return answer;
  }

  // ------------------------------------------------------------

  static serialize(store) {
    return JSON.stringify(store);
  }

  static deserialize(text) {
    return JSON.parse(text);
  }

  static isSubsequence(needle, haystack) {
    let needleIndex = 0;
    for (const haystackChar of haystack) {
      const needleChar = needle[needleIndex];
      if (haystackChar === needleChar) {
        needleIndex++;
      }
    }
    return needleIndex === needle.length;
  }
}