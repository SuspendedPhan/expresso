import NodeStore from './Node';
import AttributeStore from './Attribute';
import MetafunStore from './Metafun';
import PenStore from './Pen';
import wu from 'wu';
import OrganismCollection from './OrganismCollection';
import MetaorganismCollection from './MetaorganismCollection';
import Time from "./Time";
import { DateTime } from 'luxon';

export class RootStore {
  constructor() {
    // CHECK -- does your store need to be serialized? Consider testing it later.
    this.organismStore = new OrganismCollection(this);
    this.organismCollection = this.organismStore;
    this.metaorganismCollection = new MetaorganismCollection();
    this.attributeStore = new AttributeStore(this);
    this.nodeStore = new NodeStore(this);
    this.metafunStore = new MetafunStore(this);
    this.penStore = new PenStore(this);
    this.time = new Time();

    this.windowSize = { width: 0, height: 0 };
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

  setWindowSize(width, height) {
    this.windowSize = { width, height };
  }

  * computeRenderCommands() {
    this.time.setFrameTime(DateTime.utc());
    const universeDurationMillis = this.time.getElapsedUniverseTime().as('milliseconds');

    for (const organism of this.organismStore.getOrganisms()) {
      const timeRoot = this.attributeStore.getRootNodeFromName(organism, 'time');
      const windowHeightRoot = this.attributeStore.getRootNodeFromName(organism, 'window.height');
      const windowWidthRoot = this.attributeStore.getRootNodeFromName(organism, 'window.width');
      this.nodeStore.putChild(timeRoot, 0, this.nodeStore.addNumber(universeDurationMillis));
      this.nodeStore.putChild(windowWidthRoot, 0, this.nodeStore.addNumber(this.windowSize.width));
      this.nodeStore.putChild(windowHeightRoot, 0, this.nodeStore.addNumber(this.windowSize.height));

      const clonesRoot = this.attributeStore.getRootNodeFromName(organism, 'clones');
      const clones = clonesRoot.eval();

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
    window.localStorage.setItem('save', JSON.stringify(this.getSerialized()));
  }

  load() {
    // return;
    const text = window.localStorage.getItem('save');
    if (text !== null) {
      const root = JSON.parse(text);
      this.deserialize(root);
    }
  }

  clearStorage() {
    window.localStorage.clear();
  }
}

export default new RootStore();
