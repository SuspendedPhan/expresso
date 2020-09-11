import { v4 as uuidv4 } from 'uuid';
import wu from 'wu';

function makeStore() {
  return {
    makeEntity: (name) => ({
      storetype: 'Entity',
      id: uuidv4(),
      name,
    }),
    entities: [],

    /** { propertyId, parentEntityId } */
    propertyParents: [],
  };
}

function makeGets(root, store) {
  return {
    fromName: function (name) {
      return wu(store.entities).find(entity => entity.name === name);
    }
  }
}

function makeActions(root, store) {
  return {
    put: function (name) {
      const entity = store.makeEntity(name);
      store.entities.push(entity);
      return entity;
    }
  }
}

export function make(root) {
  const store = makeStore();
  return {
    store,
    gets: makeGets(root, store),
    actions: makeActions(root, store),
  };
}
