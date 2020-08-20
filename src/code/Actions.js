import Node from "./Node";
import { MetanodesByName } from "./Metanodes";

export class Actions {
  static replaceNode(store, oldNode, newNode) {
    const parentByNode = store.parentByNode;
    
    // need recurse here
    for (const child of oldNode.children ?? []) {
      parentByNode.delete(child);
    }

    const parent = parentByNode.get(oldNode);
    parentByNode.delete(oldNode);
    
    var childKey = null;
    for (const key in parent.children) {
      if (parent.children[key] === oldNode) {
        childKey = key;
      }
    }

    console.assert(childKey != null);
    parent.children[childKey] = newNode;
    parentByNode.set(newNode, parent);
    for (const child of newNode.children ?? []) {
      parentByNode.set(child, newNode);
    }
  }

  static addProperty(store, entity, propertyName) {
    const node = Node.make(MetanodesByName.get('Variable'));
    entity[propertyName] = node;
    store.parentByNode.set(node, entity);
    store.parentByNode.set(node.children[0], node);
  }
}