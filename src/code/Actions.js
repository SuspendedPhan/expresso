import Node from "./Node";
import { MetanodesByName } from "./Metanodes";
import Functions from "./Functions";

export class Actions {
  static replaceNode(store, oldNode, newMetanode, makeArgs) {
    var store;
    var oldNode;
    var newNode;
    if (arguments.length === 3) {
      [store, oldNode, newNode] = arguments;
    } else if (arguments.length === 4) {
      newNode = Node.make(newMetanode, makeArgs);
    } else {
      console.error('wrong argument count');
    }

    const parentByNode = store.parentByNode;
    
    const parent = parentByNode.get(oldNode);
    Functions.topDown(oldNode, (node) => parentByNode.delete(node));

    if (parent.children == null) throw {};
    
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
    node.storetype = 'Property';
    entity[propertyName] = node;
    store.parentByNode.set(node, entity);
    store.parentByNode.set(node.children[0], node);
  }

  static addEntity(store, entityName) {
    store[entityName] = { storetype: 'Entity' };
  }

  // static addVariable(store, entity, variableName) {
  //   const node = Node.make(MetanodesByName.get('Variable'));
  //   entity.variables.push(node);
  //   store.parentByNode.set(node, entity);
  //   store.parentByNode.set(node.children[0], node);
  // }
}