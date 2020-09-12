import wu from 'wu';
import { v4 as uuidv4 } from 'uuid';
import { MetanodesByName } from '../code/Metanodes';

function makeStore(root) {
  return {
    computedProperties: [],
    editableProperties: [],
    makeEditableProperty: (name) => ({
      name,
      id: uuidv4(),
    }),
    
    /** { childPropertyId, parentEntityId } */
    propertyParents: [],

    /** { propertyId, rootNodeId } */
    rootNodes: [],
  };
}

function makeGets(root, moduleRoot) {
  return {
    parent(property) {
      const answer = wu(moduleRoot.gets.propertyParents).find(row => row.childPropertyId === property);
      console.assert(answer, 'prop has no parent entity');
      return answer;
    },

    rootNode(property) {
      const row = wu(moduleRoot.store.rootNodes).find(row => row.propertyId === property.id);
      console.assert(row, 'has root node');
      return root.node.gets.fromId(row.rootNodeId);
    }
  }
}

function makeActions(root, moduleRoot) {
  return {
    putEditable: function (entity, propertyName) {
      const answer = moduleRoot.store.makeEditableProperty(name);
      const rootNode = root.node.actions.create(MetanodesByName.get('Variable'))
      moduleRoot.store.editableProperties.push(answer);
      moduleRoot.store.propertyParents.push({ childPropertyId: answer.id, parentEntityId: entity.id });
      moduleRoot.store.rootNodes.push({ propertyId: answer.id, rootNodeId: rootNode.id });
      return answer;
    }
  }
}

export function make(root) {
  const moduleRoot = {};
  moduleRoot.store = makeStore(root);
  moduleRoot.gets = makeGets(root, moduleRoot);
  moduleRoot.actions = makeActions(root, moduleRoot);
  return moduleRoot;
}

