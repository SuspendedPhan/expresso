import { v4 as uuidv4 } from 'uuid';
import wu from 'wu';
import { MetaOrganism } from './MetaorganismCollection';
import { Root } from './Root';

function makeOrganism({ name }) {
  return {
    storetype: 'Organism',
    id: uuidv4(),
    name,
    metaorganismId: null,
  };
}

interface OrganEntry {
  organId: string;
  superorganismId: string;
}

export default class OrganismCollection {
  organisms = [] as Array<any>;
  organs = [] as OrganEntry[];
  rootOrganism = null as any;

  constructor(private root: Root) {}

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

  putFromMeta(name, metaorganism: MetaOrganism) {
    const organism = this.putFromMetaWithoutAttributes(name, metaorganism);
    for (const metaattribute of metaorganism.attributes) {
      const attribute = this.root.attributeStore.putEditable(organism, metaattribute.name);
      if (metaattribute.default !== undefined) {
        this.root.attributeStore.assignNumber(attribute, metaattribute.default);
      }
    }
    const clones = this.root.attributeStore.putEditable(organism, 'clones');
    this.root.attributeStore.assignNumber(clones, 1);

    this.root.attributeStore.putEmergent(organism, 'cloneNumber');
    this.root.attributeStore.putEmergent(organism, 'time');
    this.root.attributeStore.putEmergent(organism, 'window.width');
    this.root.attributeStore.putEmergent(organism, 'window.height');
    return organism;
  }

  remove(organism) {
    this.organisms = wu(this.organisms).reject(row => row === organism).toArray();
  }

  spawn() {
    const metacircle = this.root.metaorganismCollection.getFromName('Circle');
    const organism = this.putFromMeta(null, metacircle);
    organism.name = organism.id;
    return organism;
  }

  putFromMetaname(name, metaname: string) {
    const metaorganism = this.root.metaorganismCollection.getFromName(metaname);
    return this.putFromMeta(name, metaorganism);
  }

  addChild(superorganism, organ) {
    this.organs = wu(this.organs).reject(t => t.organId === organ.id).toArray();
    this.organs.push({ superorganismId: superorganism.id, organId: organ.id });
  }

  getChildren(superorganism) {
    const organEntries = wu(this.organs).filter(t => t.superorganismId === superorganism.id);
    return organEntries.map(t => this.getOrganismFromId(t.organId));
  }

  putFromMetaWithoutAttributes(name, metaorganism) {
    const organism = makeOrganism({ name });
    if (organism.name === undefined) {
      organism.name = organism.id;
    }
    organism.metaorganismId = metaorganism.id;
    this.organisms.push(organism);
    console.assert(organism !== undefined);
    return organism;
  }
}
