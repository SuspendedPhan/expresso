import Node from "./Node";
import { MetanodesByName } from "./Metanodes";
import Functions from "./Functions";
import Gets from "./Gets";
import Vue from 'vue';

export default class Actions {
  static replaceNode(store, oldNode, newMetanode, makeArgs) {
    var store;
    var oldNode;
    var newNode;
    if (arguments.length === 3) {
      [store, oldNode, newNode] = arguments;
    } else if (arguments.length === 4) {
      console.assert(oldNode.storetype === 'node', new Error().stack);
      console.assert(Array.isArray(makeArgs), new Error().stack);
      newNode = Node.make(newMetanode, ...makeArgs);
    } else {
      console.error('wrong argument count');
    }

    const parent = Gets.parentForNode(store, oldNode);
    for (const node of Functions.topDown(oldNode)) {
      Actions.unparent(store, node);
    }

    if (parent.children == null) throw {};
    
    var childKey = null;
    for (const key in parent.children) {
      if (parent.children[key] === oldNode) {
        childKey = key;
      }
    }

    console.assert(childKey != null);

    Vue.set(parent.children, childKey, newNode);
    Actions.setParent(store, newNode, parent);
    for (const child of newNode.children ?? []) {
      Actions.setParent(store, child, newNode);
    }
    store.storeObjectById[newNode.id] = newNode;
    return newNode;
  }

  

  static addProperty(store, entity, propertyName) {
    return this.addEditableProperty(store, entity, propertyName);
  }

  static addEditableProperty(store, entity, propertyName) {
    const node = Node.make(MetanodesByName.get('Variable'));
    node.storetype = 'Property';
    entity.editableProperties[propertyName] = node;
    Actions.setParent(store, node, entity);
    Actions.setParent(store, node.children[0], node);
    store.storeObjectById[node.id] = node;
    return node;
  }

  static addComputedProperty(store, entity, propertyName) {
    const node = Node.make(MetanodesByName.get('Variable'));
    node.storetype = 'Property';
    entity.computedProperties[propertyName] = node;
    Actions.setParent(store, node, entity);
    Actions.setParent(store, node.children[0], node);
    store.storeObjectById[node.id] = node;
    return node;
  }

  // --------- variables -----------

  /**
   * @param {[]} makeArgs array
   */
  static assignVariable(store, variable, newMetanode, makeArgs) {
    return Actions.replaceNode(store, variable.children[0], newMetanode, makeArgs);
  }

  static assignNumberToVariable(store, variable, value) {
    return Actions.replaceNode(store, variable.children[0], MetanodesByName.get('Number'), [value]);
  }

  // ----------------------------------

  static eval(store, node) {
    return Node.eval(node);
  }

  static * computeRenderCommands(store, entity) {
    const clonesNode = Gets.property(entity, 'clones');
    const clones = Actions.eval(store, clonesNode);
    const cloneNumberNode = Gets.computedProperty(entity, 'cloneNumber');
    const cloneNumber01Node = Gets.computedProperty(entity, 'cloneNumber01');
    for (let cloneNumber = 0; cloneNumber < clones; cloneNumber++) {
      Actions.assignVariable(store, cloneNumberNode, MetanodesByName.get('Number'), [cloneNumber]);
      const cloneNumber01 = cloneNumber / Math.max(1, clones - 1);
      Actions.assignVariable(store, cloneNumber01Node, MetanodesByName.get('Number'), [cloneNumber01]);
      const command = {};
      for (const property of _.values(Gets.properties(entity))) {
        if (property === clonesNode) continue;
        if (property === cloneNumberNode) continue;
        if (property === cloneNumber01Node) continue;
        const propertyName = Gets.propertyName(store, property);
        command[propertyName] = Actions.eval(store, property);
      }
      yield command;
    }
  }

  // ----------------------------------

  static moveCursorToNode(store, node) {
    console.assert(arguments.length === 2, new Error().stack);
    // store.cursorPosition = node;
    Vue.set(store, 'cursorPosition', node);
  }

  static moveCursorLeft(store) {
    console.assert(store.cursorPosition != null, new Error().stack);
    this.moveCursor(store, Functions.traverseLeft);
  }

  static moveCursorRight(store) {
    console.assert(store.cursorPosition != null, new Error().stack);
    this.moveCursor(store, Functions.traverseRight);
  }

  static moveCursor(store, traverseFunction) {
    console.assert(store.cursorPosition != null, new Error().stack);
    const parentGetter = (node) => {
      const parent = Gets.parentForNode(store, node);
      if (parent.metaname === 'Variable') return null;
      return parent;
    };
    const childrenGetter = (node) => Gets.childrenForNode(node) ?? [];
    const traverse = traverseFunction(store.cursorPosition, parentGetter, childrenGetter);
    const node = traverse.next().value;
    if (node !== undefined) {
      this.moveCursorToNode(store, node);
    }
  }

  // --------------------------------------------------------------------

  static enterTokenPicking(store) {
    Vue.set(store, 'tokenPickingInProgress', true);
    store.tokenPickingInProgress = true;
  }
  
  static exitTokenPicking(store) {
    Vue.set(store, 'tokenPickingInProgress', false);
  }

  // --------------------------------------------------------------------

  static setParent(store, node, parent) {
    store.parentIdByNodeId[node.id] = parent.id;
  }

  static unparent(store, node) {
    delete store.parentIdByNodeId[node.id];
  }

  // --------------------------------------------------------------------

  static save(store) {
    const copy = {};
    Object.assign(copy, store);
    delete copy.storeObjectById;
    window.localStorage.setItem('save', Functions.serialize(copy));
    console.log(copy);
  }

  static load(store) {
    // return;
    const text = window.localStorage.getItem('save');
    if (text !== null) {
      console.log(text);
      for (const key in store) delete store[key];

      const loadedStore = Functions.deserialize(text);
      loadedStore.storeObjectById = {};
      for (const node of Functions.allNodes(loadedStore)) {
        loadedStore.storeObjectById[node.id] = node;
      }
      const circle = Gets.entity(loadedStore, 'circle');
      loadedStore.storeObjectById[circle.id] = circle;

      Object.assign(store, loadedStore);
    }
  }
}