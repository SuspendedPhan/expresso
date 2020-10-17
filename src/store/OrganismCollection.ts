import { v4 as uuidv4 } from 'uuid';
import wu from 'wu';
import { MetaOrganism } from './MetaorganismCollection';
import { Root } from './Root';
import Types from './Types';

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

export interface Organism {
  id: string;
  name: string;
  storetype: 'Organism';
  metaorganismId: string;
}

export default class OrganismCollection {
  organisms = [] as Organism[];
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

  getOrganismFromId(organismId): Organism {
    const organism = wu(this.organisms).find(row => row.id === organismId);
    console.assert(organism as any);
    return organism as any;
  }

  getSerialized() {
    return {
      organisms: this.organisms,
      organs: this.organs,
      rootOrganism: this.rootOrganism,
    };
  }

  getOrganismFromPath(...path: string[]) {
    let organism = this.rootOrganism;
    for (const organismName of path) {
      const children = this.getChildren(organism);
      organism = children.find(t => t?.name === organismName);
      console.assert(organism);
    }
    return organism;
  }

  * getAncestors(organism) {
    console.assert(organism);
    while (true) {
      organism = this.getSuper(organism);
      if (organism === undefined) return;
      yield organism;
    }
  }

  getSuper(organism: Organism): Organism | undefined {
    const superorganismId = this.organs.find(t => t.organId === organism.id)?.superorganismId;
    if (!superorganismId) {
      console.assert(organism.id === this.rootOrganism.id);
      return undefined;
    }
    return this.getOrganismFromId(superorganismId);
  }
  
  getRoot(): Organism {
    return this.rootOrganism;
  }

  // --- ACTIONS ---

  deserialize(store) {
    Object.assign(this, store);
  }

  /**
   * @deprecated
   */
  put(name): Organism {
    const organism = makeOrganism({ name }) as any;
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

      if (metaattribute.type === Types.Vector) {
        this.root.attributeCollection.assign(attribute, this.root.nodeCollection.addVector());
      }
    }

    if (metaorganism.name !== 'TheVoid') {
      const clones = this.root.attributeStore.putEditable(organism, 'clones');
      this.root.attributeStore.putEmergent(organism, 'cloneNumber');
      this.root.attributeStore.putEmergent(organism, 'cloneNumber01');
      this.root.attributeStore.assignNumber(clones, 1);
    }

    return organism;
  }

  remove(organism) {
    console.assert(organism !== this.rootOrganism);

    for (const attribute of this.root.attributeCollection.getAttributesForOrganism(organism)) {
      this.root.attributeCollection.remove(attribute);
    }
    for (const organ of this.getChildren(organism)) {
      this.remove(organ);
    }
    this.organs = wu(this.organs).reject(t => t.organId === organism.id || t.superorganismId === organism.id).toArray();
    this.organisms = wu(this.organisms).reject(t => t.id === organism.id).toArray();
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
    console.assert(organ);
    console.assert(superorganism);
    this.organs = wu(this.organs).reject(t => t.organId === organ.id).toArray();
    this.organs.push({ superorganismId: superorganism.id, organId: organ.id });
    return organ;
  }

  getChildren(superorganism) {
    const organEntries = wu(this.organs).filter(t => t.superorganismId === superorganism.id);
    return organEntries.map(t => this.getOrganismFromId(t.organId));
  }

  putFromMetaWithoutAttributes(name, metaorganism) {
    const organism = makeOrganism({ name }) as any;
    if (organism.name === undefined) {
      organism.name = organism.id;
    }
    organism.metaorganismId = metaorganism.id;
    this.organisms.push(organism);
    console.assert(organism !== undefined);
    return organism;
  }

  putSuperOrganismWithoutAttributes(name: string) {
    const answer = this.putFromMetaWithoutAttributes(name, this.root.metaorganismCollection.getFromName('SuperOrganism'));
    console.assert(answer);
    return answer;
  }

  initRootOrganism() {
    if (this.rootOrganism) return;
    
    this.rootOrganism = this.putFromMetaname('The Void', 'TheVoid');
    this.root.attributeCollection.putEmergent(this.rootOrganism, 'time');
    this.root.attributeCollection.putEmergent(this.rootOrganism, 'time01');
    this.root.attributeCollection.putEmergent(this.rootOrganism, 'window.height');
    this.root.attributeCollection.putEmergent(this.rootOrganism, 'window.width');
    return this.rootOrganism;
  }
}
