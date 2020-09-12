import EntityStore from './Entity';
import NodeStore from './Node';
import PropertyStore from './Property';

export class RootStore {
  constructor() {
    this.entityStore = new EntityStore(this);
    this.propertyStore = new PropertyStore(this);
    this.nodeStore = new NodeStore(this);
  }
}

export default new RootStore();
