import OrganismStore from './Organism';
import NodeStore from './Node';
import AttributeStore from './Attribute';
import MetafunStore from './Metafun';
import PenStore from './Pen';
import wu from 'wu';

export class RootStore {
  constructor() {
    this.organismStore = new OrganismStore(this);
    this.attributeStore = new AttributeStore(this);
    this.nodeStore = new NodeStore(this);
    this.metafunStore = new MetafunStore(this);
    this.penStore = new PenStore(this);
  }

  // --- GETS ---

  getSerialized() {
    return {
      organismStore: this.organismStore.getSerialized(),
      attributeStore: this.attributeStore.getSerialized(),
      nodeStore: this.nodeStore.getSerialized(),
      metafunStore: this.metafunStore.getSerialized(),
      penStore: this.penStore.getSerialized(),
    };
  }

  // --- ACTIONS ---

  * computeRenderCommands() {
    for (const organism of this.organismStore.getOrganisms()) {
      const clones = this.attributeStore.getRootNodeFromName(organism, 'clones').eval();
      for (const cloneNumber of wu.count().take(clones)) {
        const cloneNumberRoot = this.attributeStore.getRootNodeFromName(organism, 'cloneNumber');
        this.nodeStore.putChild(cloneNumberRoot, 0, this.nodeStore.addNumber(cloneNumber));
        
        const renderCommand = {};
        for (const attribute of this.attributeStore.getEditables(organism)) {
          if (attribute.name === 'clones') continue;
          renderCommand[attribute.name] = this.attributeStore.getRootNode(attribute).eval();
        }
        yield renderCommand;
      }
    }
  }

  deserialize(root) {
    this.organismStore.deserialize(root.organismStore);
    this.attributeStore.deserialize(root.attributeStore);
    this.nodeStore.deserialize(root.nodeStore);
    this.metafunStore.deserialize(root.metafunStore);
    this.penStore.deserialize(root.penStore);
  }

  save() {

  }

  load() {

  }
}

export default new RootStore();
