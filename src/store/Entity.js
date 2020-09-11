import { v4 as uuidv4 } from 'uuid';

export function makeStore() {
  return {
    storetype: 'Entity',
    editableProperties: {},
    computedProperties: {},
    id: uuidv4(),
  }
}

// -------------------- GETS -----------------------


// -------------------- ACTIONS --------------------

export function addEntity(root, entityName) {
  const entity = makeStore();
  root[entityName] = entity;
  root.storeObjectById[entity.id] = entity;
  return entity;
}

// fix imports
export function entity(store, entityName) {
  console.assert(arguments.length === 2, new Error().stack);
  return store[entityName];
}

export function entityForNode(store, node) {
  console.assert(arguments.length === 2, new Error().stack);
  for (const ancestor of Functions.ancestors(store, node)) {
    if (ancestor.storetype === 'Entity') return ancestor;
  }
  console.assert(false, new Error().stack);
}