import { v4 as uuidv4 } from 'uuid';
import wu from 'wu';
import { RootStore } from './Root';

function makeOrganism({ name }) {
  return {
    storetype: 'Organism',
    id: uuidv4(),
    name,
    metaorganismId: null,
  };
}

export default class OrganismCollection {
  /**
   * @param {RootStore} root 
   */
  constructor(root) {
    this.root = root;
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

  /**
   * @deprecated
   */
  put(name) {
    const organism = makeOrganism({ name });
    this.organisms.push(organism);
    return organism;
  }

  putFromMeta(name, metaorganism) {
    const organism = makeOrganism({ name });
    organism.metaorganismId = metaorganism.id;
    for (const attributeName of metaorganism.attributeNames) {
      this.root.attributeStore.putEditable(organism, attributeName);
    }
    this.root.attributeStore.putEditable(organism, 'clones');
    this.root.attributeStore.putEmergent(organism, 'cloneNumber');
    this.organisms.push(organism);
    return organism;
  }
}
