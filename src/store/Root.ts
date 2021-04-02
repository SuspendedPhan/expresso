import MetafunStore from "./Metafun";
import PenStore from "./Pen";
import wu from "wu";
import OrganismCollection, { Organism } from "./OrganismCollection";
import MetaorganismCollection from "./MetaorganismCollection";
import Time from "./Time";
import { DateTime } from "luxon";
import WordCollection from "./WordCollection";
import Types from "./Types";
import { OrganismLayout } from "./OrganismLayout";
import Attribute from "@/models/Attribute";
import Renderer from "@/code/Renderer";
import Node from "@/models/Node";

export enum RenderShape {
  Circle = "Circle",
  Rectangle = "Rectangle",
  Line = "Line",
  None = "None",
}

export class Root {
  // CHECK -- does your store need to be serialized? Consider testing it later.
  wordCollection = new WordCollection();
  nodeCollection = Node;
  nodeStore = this.nodeCollection;
  organismLayout = new OrganismLayout(this);

  metaorganismCollection = new MetaorganismCollection(this);

  attributeCollection = Attribute;
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
  mostRecentClickCoordinates = {x: 0, y: 0}

  constructor() {
    // hack
    this.attributeCollection.rootStore = this;
    this.nodeCollection.root = this;
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

  setWindowSize(width: number, height: number) {
    this.windowSize = { width, height };
  }

  setMouseLocation(x: number, y: number) {
    this.mostRecentClickCoordinates = { x, y };
  }

  *computeRenderCommands(): Iterable<any> {
    yield* Renderer.computeRenderCommands();
  }

  deserialize(root) {
    this.organismStore.deserialize(root.organismStore);
    this.attributeStore.deserialize(root.attributeStore);
    this.nodeStore.deserialize(root.nodeStore);
    this.penStore.deserialize(root.penStore);
  }

  save() {
    window.localStorage.setItem("save", JSON.stringify(this.getSerialized()));
  }

  load() {
    // return;
    const text = window.localStorage.getItem("save");
    if (text !== null) {
      const root = JSON.parse(text);
      this.deserialize(root);
    }
  }

  clearStorage() {
    window.localStorage.clear();
  }

  toTree(subtree = {}, organism = undefined as any) {
    if (!organism) {
      organism = this.organismCollection.rootOrganism;
    }

    const organTree = {};
    const metaorganism = this.metaorganismCollection.getFromId(
      organism.metaorganismId
    );
    subtree[`${metaorganism.name} ${organism.name}`] = organTree;

    for (const attribute of this.attributeCollection.getEditables(organism)) {
      const rootNode = this.attributeCollection.getRootNode(attribute);
      const childRootNode = this.nodeStore.getChild(rootNode, 0);
      const key = `editattr ${attribute.name} ${attribute.datatype}`;
      const rootNodeTree = {};
      organTree[key] = rootNodeTree;
      this.nodeStore.toTree2(childRootNode, rootNodeTree);
    }
    for (const attribute of this.attributeCollection.getEmergents(organism)) {
      const rootNode = this.attributeCollection.getRootNode(attribute);
      const childRootNode = this.nodeStore.getChild(rootNode, 0);
      const key = `emerattr ${attribute.name} ${attribute.datatype}`;
      const rootNodeTree = {};
      organTree[key] = rootNodeTree;
      this.nodeStore.toTree2(childRootNode, rootNodeTree);
    }

    for (const child of this.organismCollection.getChildren(organism)) {
      this.toTree(organTree, child);
    }
    return subtree;
  }

  fromTree(subtree, superorganism = undefined as any) {
    for (const [key, value] of wu.entries(subtree)) {
      const splits = key.split(" ");
      const attributeType = splits[0];
      if (attributeType === "editattr") {
        // broken?
        // const type = splits[2] as Types;
        const type = splits[2] as any;

        const attribute = this.attributeCollection.putEditable(
          superorganism,
          splits[1],
          type
        );
        const rootNode = this.attributeCollection.getRootNode(attribute);
        this.nodeStore.fromTree(value, rootNode);
      } else if (attributeType === "emerattr") {
        this.attributeCollection.putEmergent(superorganism, splits[1]);
      } else {
        let organism;
        const metaorganism = this.metaorganismCollection.getFromName(
          attributeType
        );
        if (!superorganism) {
          this.organismCollection.rootOrganism = this.organismCollection.putFromMetaWithoutAttributes(
            "root",
            metaorganism
          );
          organism = this.organismCollection.rootOrganism;
        } else {
          organism = this.organismCollection.putFromMetaWithoutAttributes(
            splits[1],
            metaorganism
          );
          this.organismCollection.addChild(superorganism, organism);
        }
        this.fromTree(value, organism);
      }
    }
    return this;
  }

  toTreeJson() {
    return JSON.stringify(this.toTree(), null, 2);
  }
}

export default new Root();
