import Metanodes, { MetanodesByName } from "./Metanodes";
import Functions from "./Functions";
import _, { pick } from "lodash";

export default class Gets {
  static * nodePicks(store, pickInput, nodeToReplace) {
    console.assert(arguments.length === 3, new Error().stack);
    console.assert(typeof pickInput === 'string', new Error().stack);

    const number = Number.parseFloat(pickInput);
    if (!Number.isNaN(number)) {
      yield { metanode: MetanodesByName.get('Number'), args: [number], text: number.toString() };
      return;
    }

    const entity = Gets.entityForNode(store, nodeToReplace);
    const propertyToReplace = Gets.propertyForNode(store, nodeToReplace);
    const properties = _.concat(_.values(Gets.properties(entity)), _.values(Gets.computedProperties(entity)));
    for (const propertyNode of properties) {
      if (propertyNode === propertyToReplace) continue;

      console.assert(propertyNode.metaname === 'Variable', new Error().stack);

      const propertyName = Gets.propertyName(store, propertyNode) ?? Gets.computedPropertyName(store, propertyNode);

      if (pickInput.length === 0 || propertyName.toLowerCase().includes(pickInput.toLowerCase())) {
        yield { metanode: MetanodesByName.get('Reference'), args: [propertyNode], text: propertyName };
      }
    }

    yield* Metanodes
      .filter(metanode => metanode.metatype === 'Function')
      .filter(metanode => pickInput.length === 0 || metanode.name.toLowerCase().includes(pickInput.toLowerCase()))
      .map(metanode => ({
        metanode,
        args: [],
        text: metanode.name,
      }));
  }

  static entity(store, entityName) {
    console.assert(arguments.length === 2, new Error().stack);
    return store[entityName];
  }

  static entityForNode(store, node) {
    console.assert(arguments.length === 2, new Error().stack);
    for (const ancestor of Functions.ancestors(store, node)) {
      if (ancestor.storetype === 'Entity') return ancestor;
    }
    console.assert(false, new Error().stack);
  }

  static parentForNode(store, node) {
    console.assert(arguments.length === 2, new Error().stack);
    const parentId = store.parentIdByNodeId[node.id];
    return store.storeObjectById[parentId];
  }

  static childrenForNode(node) {
    return node.children;
  }

  static propertyForNode(store, node) {
    console.assert(arguments.length === 2, new Error().stack);
    if (node.storetype === 'Property') return node;
    for (const visit of Functions.ancestors(store, node)) {
      if (visit.storetype === 'Property') return visit;
    }
  }

  // -------------------------------------------------------------

  static propertyName(store, propertyNode) {
    console.assert(arguments.length === 2, new Error().stack);
    console.assert(propertyNode.storetype === 'Property', new Error().stack);
    const entity = Gets.entityForNode(store, propertyNode);
    for (const propertyName in entity.editableProperties) {
      if (entity.editableProperties[propertyName] === propertyNode) return propertyName;
    }
  }

  static computedPropertyName(store, propertyNode) {
    console.assert(arguments.length === 2, new Error().stack);
    console.assert(propertyNode.storetype === 'Property', new Error().stack);
    const entity = Gets.entityForNode(store, propertyNode);
    for (const propertyName in entity.computedProperties) {
      if (entity.computedProperties[propertyName] === propertyNode) return propertyName;
    }
  }

  // -------------------------------------------------------------

  static property(entity, propertyName) {
    return this.editableProperty(entity, propertyName);
  }

  static editableProperty(entity, propertyName) {
    const answer = entity.editableProperties[propertyName];
    console.assert(answer);
    return answer;
  }

  static computedProperty(entity, propertyName) {
    const answer = entity.computedProperties[propertyName];
    console.assert(answer);
    return answer;
  }

  // -------------------------------------------------------------

  static properties(entity) {
    const answer = {};
    return Object.assign(answer, this.editableProperties(entity), this.computedProperties(entity));
  }

  static editableProperties(entity) {
    console.assert(arguments.length === 1, new Error().stack);
    console.assert(entity.storetype === 'Entity', new Error().stack);
    return entity.editableProperties;
  }

  static computedProperties(entity) {
    console.assert(arguments.length === 1, new Error().stack);
    console.assert(entity.storetype === 'Entity', new Error().stack);
    return entity.computedProperties;
  }

  // -------------------------------------------------------------

  
}