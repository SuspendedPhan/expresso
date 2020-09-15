import OrganismStore from './Organism';
import NodeStore from './Node';
import AttributeStore from './Attribute';
import MetafunStore from './Metafun';
import wu from 'wu';

export class RootStore {
  constructor() {
    this.organismStore = new OrganismStore(this);
    this.attributeStore = new AttributeStore(this);
    this.nodeStore = new NodeStore(this);
    this.metafunStore = new MetafunStore(this);
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
}

export default new RootStore();
