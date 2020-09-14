import OrganismStore from './Organism';
import NodeStore from './Node';
import PropertyStore from './Property';
import MetafunStore from './Metafun';

export class RootStore {
  constructor() {
    this.organismStore = new OrganismStore(this);
    this.propertyStore = new PropertyStore(this);
    this.nodeStore = new NodeStore(this);
    this.metafunStore = new MetafunStore(this);
  }
}

export default new RootStore();
