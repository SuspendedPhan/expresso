import NodeStore from './Node';
import AttributeStore from './Attribute';
import MetafunStore from './Metafun';
import PenStore from './Pen';
import wu from 'wu';
import OrganismCollection from './OrganismCollection';
import MetaorganismCollection from './MetaorganismCollection';
import Time from "./Time";
import { DateTime } from 'luxon';
import AttributeCollection from './AttributeCollection';

export enum RenderShape {
  Circle = 'Circle',
  Rectangle = 'Rectangle',
  None = 'None',
}

export class Root {

  // CHECK -- does your store need to be serialized? Consider testing it later.
  nodeStore = new NodeStore(this);

  metaorganismCollection = new MetaorganismCollection(this);
  
  attributeCollection = new AttributeCollection(this);
  /** @deprecated */
  attributeStore = this.attributeCollection;

  /** @deprecated */
  organismStore = new OrganismCollection(this);

  organismCollection = this.organismStore;
  metafunStore = new MetafunStore(this);
  penStore = new PenStore(this);
  time = new Time(this);
  windowSize = { width: 0, height: 0 };

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

  setWindowSize(width: number, height: number) {
    this.windowSize = { width, height };
  }

  * computeRenderCommands(): Iterable<any> {
    this.time.setFrameTime(DateTime.utc());
    const universeDurationMillis = this.time.getElapsedUniverseTime().as('milliseconds');
    const time01 = universeDurationMillis / this.time.getUniverseLifespan().as('milliseconds');

    for (const organism of this.organismStore.getOrganisms()) {
      const timeRoot = this.attributeStore.getRootNodeFromName(organism, 'time');
      let time01Root = this.attributeStore.getRootNodeFromName(organism, 'time01', false);
      if (time01Root === undefined) {
        time01Root = this.attributeStore.putEmergent(organism, 'time01');
      }
      const windowHeightRoot = this.attributeStore.getRootNodeFromName(organism, 'window.height');
      const windowWidthRoot = this.attributeStore.getRootNodeFromName(organism, 'window.width');
      this.nodeStore.putChild(timeRoot, 0, this.nodeStore.addNumber(universeDurationMillis));
      this.nodeStore.putChild(time01Root, 0, this.nodeStore.addNumber(time01));
      this.nodeStore.putChild(windowWidthRoot, 0, this.nodeStore.addNumber(this.windowSize.width));
      this.nodeStore.putChild(windowHeightRoot, 0, this.nodeStore.addNumber(this.windowSize.height));

      const clonesRoot = this.attributeStore.getRootNodeFromName(organism, 'clones');
      const clones = clonesRoot.eval();

      const metaorganism = this.metaorganismCollection.getFromId(organism.metaorganismId) as any;

      for (const cloneNumber of wu.count().take(clones)) {
        const cloneNumberRoot = this.attributeStore.getRootNodeFromName(organism, 'cloneNumber');
        this.nodeStore.putChild(cloneNumberRoot, 0, this.nodeStore.addNumber(cloneNumber));
        
        const renderCommand = {} as any;
        renderCommand.shape = metaorganism.renderShape;
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

  toTree(
    subtree = {},
    organism = undefined as any,
  ) {
    if (!organism) {
      organism = this.organismCollection.rootOrganism;
    }

    const organTree = {};
    subtree[`org ${organism.name}`] = organTree;
    
    for (const attribute of this.attributeCollection.getEditables(organism)) {
      const rootNode = this.attributeCollection.getRootNode(attribute);
      const key = `editattr ${attribute.name}`;
      const rootNodeTree = {};
      organTree[key] = rootNodeTree;
      rootNodeTree['Variable'] = this.nodeStore.toTree(rootNode);
    }
    for (const attribute of this.attributeCollection.getEmergents(organism)) {
      const rootNode = this.attributeCollection.getRootNode(attribute);
      const key = `emerattr ${attribute.name}`;
      const rootNodeTree = {};
      organTree[key] = rootNodeTree;
      rootNodeTree['Variable'] = this.nodeStore.toTree(rootNode);
    }

    for (const child of this.organismCollection.getChildren(organism)) {
      this.toTree(organTree, child);
    }
    return subtree;
  }

  fromTree(
    subtree,
    superorganism = undefined as any,
  ) {
    for (const [key, value] of wu.entries(subtree)) {
      const splits = key.split(' ');
      const type = splits[0];
      if (type === 'org') {
        let organism;
        const metaorganism = this.metaorganismCollection.getFromName('SuperOrganism');
        if (!superorganism) {
          this.organismCollection.rootOrganism = this.organismCollection.putFromMetaWithoutAttributes('root', metaorganism);
          organism = this.organismCollection.rootOrganism;
        } else {
          organism = this.organismCollection.putFromMetaWithoutAttributes(splits[1], metaorganism);
          this.organismCollection.addChild(superorganism, organism);
        }
        this.fromTree(value, organism);
      } else if (type === 'editattr') {
        this.attributeCollection.putEditable(superorganism, splits[1]);
      } else if (type === 'emerattr') {
        this.attributeCollection.putEmergent(superorganism, splits[1]);
      }
    }
    return this;
  }
}

export default new Root();
