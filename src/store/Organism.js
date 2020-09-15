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
  }

  // --- GETS ---

  getFromName(name) {
    return wu(this.organisms).find(organism => organism.name === name);
  }

  getOrganisms() {
    return this.organisms;
  }

  getOrganismFromId(organismId) {
    const organism = wu(this.organisms).find(row => row.id === organismId);
    console.assert(organism);
    return organism;
  }

  getSerialized() {
    return {
      organisms: this.organisms,
    };
  }

  // --- ACTIONS ---

  deserialize(store) {
    Object.assign(this, store);
  }

  put(name) {
    const organism = makeOrganism({ name });
    this.organisms.push(organism);
    return organism;
  }
}
