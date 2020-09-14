import { v4 as uuidv4 } from 'uuid';
import wu from 'wu';
import { RootStore } from './Root';

function makeOrganism({ name }) {
  return {
    storetype: 'Organism',
    id: uuidv4(),
    name,
  };
}

export default class OrganismStore {
  /**
   * @param {RootStore} rootStore 
   */
  constructor(rootStore) {
    this.rootStore = rootStore;
    this.organisms = [];

    /** { attributeId, parentOrganismId } */
    this.attributeParents = [];
  }

  getFromName(name) {
    return wu(this.organisms).find(organism => organism.name === name);
  }

  put(name) {
    const organism = makeOrganism({ name });
    this.organisms.push(organism);
    return organism;
  }
}
