import NodeStore from './Node';
import AttributeStore from './Attribute';
import MetafunStore from './Metafun';
import PenStore from './Pen';
import wu from 'wu';
import OrganismCollection, { Organism } from './OrganismCollection';
import MetaorganismCollection from './MetaorganismCollection';
import Time from "./Time";
import { DateTime } from 'luxon';
import AttributeCollection from './AttributeCollection';
import WordCollection from './WordCollection';

export enum RenderShape {
  Circle = 'Circle',
  Rectangle = 'Rectangle',
  None = 'None',
}

export class Root {

  // CHECK -- does your store need to be serialized? Consider testing it later.
  wordCollection = new WordCollection();
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
  pen = this.penStore;
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
    const organism = this.organismCollection.getRoot();
    
    const timeRoot = this.attributeCollection.getRootNodeFromName(organism, 'time', false);
    let time01Root = this.attributeCollection.getRootNodeFromName(organism, 'time01', false);
    if (time01Root === undefined) {
      time01Root = this.attributeCollection.putEmergent(organism, 'time01');
    }
    const windowHeightRoot = this.attributeCollection.getRootNodeFromName(organism, 'window.height',  false);
    const windowWidthRoot = this.attributeCollection.getRootNodeFromName(organism, 'window.width', false);
    
    if (timeRoot) {
      this.nodeStore.putChild(timeRoot, 0, this.nodeStore.addNumber(universeDurationMillis));
    }
    if (windowHeightRoot) {
      this.nodeStore.putChild(windowHeightRoot, 0, this.nodeStore.addNumber(this.windowSize.height));
    }
    if (windowWidthRoot) {
      this.nodeStore.putChild(windowWidthRoot, 0, this.nodeStore.addNumber(this.windowSize.width));
    }
    this.nodeStore.putChild(time01Root, 0, this.nodeStore.addNumber(time01));
    yield * this.computeRenderCommandsForOrganism(organism);
  }

  private * computeRenderCommandsForOrganism(organism): Iterable<any> {
    const clonesRoot = this.attributeCollection.getRootNodeFromName(organism, 'clones', false);
    const clones = clonesRoot?.eval() ?? 1;

    const metaorganism = this.metaorganismCollection.getFromId(organism.metaorganismId) as any;

    for (const cloneNumber of wu.count().take(clones)) {
      if (clonesRoot) {
        const cloneNumberRoot = this.attributeCollection.getRootNodeFromName(organism, 'cloneNumber');
        this.nodeStore.putChild(cloneNumberRoot, 0, this.nodeStore.addNumber(cloneNumber));
      }

      if (metaorganism.renderShape !== RenderShape.None) {
        const renderCommand = {} as any;
        renderCommand.shape = metaorganism.renderShape;
        for (const attribute of this.attributeCollection.getEditables(organism)) {
          if (attribute.name === 'clones') continue;
          renderCommand[attribute.name] = this.attributeCollection.getRootNode(attribute).eval();
        }
        yield renderCommand;
      }
      
      for (const organ of this.organismCollection.getChildren(organism)) {
        yield * this.computeRenderCommandsForOrganism(organ);
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
    const metaorganism = this.metaorganismCollection.getFromId(organism.metaorganismId);
    subtree[`${metaorganism.name} ${organism.name}`] = organTree;
    
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
      if (type === 'editattr') {
        this.attributeCollection.putEditable(superorganism, splits[1]);
      } else if (type === 'emerattr') {
        this.attributeCollection.putEmergent(superorganism, splits[1]);
      } else {
        let organism;
        const metaorganism = this.metaorganismCollection.getFromName(type);
        if (!superorganism) {
          this.organismCollection.rootOrganism = this.organismCollection.putFromMetaWithoutAttributes('root', metaorganism);
          organism = this.organismCollection.rootOrganism;
        } else {
          organism = this.organismCollection.putFromMetaWithoutAttributes(splits[1], metaorganism);
          this.organismCollection.addChild(superorganism, organism);
        }
        this.fromTree(value, organism);
      }
    }
    return this;
  }
}

export default new Root();
