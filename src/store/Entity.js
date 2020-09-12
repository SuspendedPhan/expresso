import { v4 as uuidv4 } from 'uuid';
import wu from 'wu';
import { RootStore } from './Root';

function makeEntity({ name }) {
  return {
    storetype: 'Entity',
    id: uuidv4(),
    name,
  };
}

export default class EntityStore {
  /**
   * @param {RootStore} rootStore 
   */
  constructor(rootStore) {
    this.rootStore = rootStore;
    this.entities = [];

    /** { propertyId, parentEntityId } */
    this.propertyParents = [];
  }

  getFromName(name) {
    return wu(this.entities).find(entity => entity.name === name);
  }

  put(name) {
    const entity = makeEntity({ name });
    this.entities.push(entity);
    return entity;
  }
}
