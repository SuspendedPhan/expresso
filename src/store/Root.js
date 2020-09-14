import OrganismStore from './Organism';
import NodeStore from './Node';
import AttributeStore from './Attribute';
import MetafunStore from './Metafun';

export class RootStore {
  constructor() {
    this.organismStore = new OrganismStore(this);
    this.attributeStore = new AttributeStore(this);
    this.nodeStore = new NodeStore(this);
    this.metafunStore = new MetafunStore(this);
  }
}

export default new RootStore();
