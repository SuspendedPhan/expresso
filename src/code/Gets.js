import Metanodes, { MetanodesByName } from "./Metanodes";
import Functions from "./Functions";
import _, { pick } from "lodash";

export default class Gets {
  static property(entity, propertyName) {
    const answer = entity[propertyName];
    console.assert(answer);
    return answer;
  }

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
    for (const property in entity) {
      if (property === 'storetype') continue;
      const propertyNode = entity[property];
      if (propertyNode === propertyToReplace) continue;

      console.assert(propertyNode.metaname === 'Variable', new Error().stack);

      // const path = Gets.path(store, propertyNode);
      if (pickInput.length === 0 || Gets.propertyName(store, propertyNode).includes(pickInput)) {
        yield { metanode: MetanodesByName.get('Reference'), args: [propertyNode], text: property };
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

  static propertyForNode(store, node) {
    console.assert(arguments.length === 2, new Error().stack);
    if (node.storetype === 'Property') return node;
    for (const visit of Functions.ancestors(store, node)) {
      if (visit.storetype === 'Property') return visit;
    }
  }

  static propertyName(store, propertyNode) {
    console.assert(arguments.length === 2, new Error().stack);
    console.assert(propertyNode.storetype === 'Property', new Error().stack);
    const entity = Gets.entityForNode(store, propertyNode);
    for (const propertyName in entity) {
      if (entity[propertyName] === propertyNode) return propertyName;
    }
    console.assert(false, new Error().stack);
  }

  // static path(store, propertyNode) {
  //   console.assert(arguments.length === 2);
  //   return [propertyNode.name, ...Functions.ancestors(store, propertyNode)].reverse().join('.');
  // } 

  // static getVariable(entity, variableName) {
  //   const answer = entity.variables.find(variable => variable.name === variableName);
  //   console.assert(answer);
  //   return answer;
  // }
}