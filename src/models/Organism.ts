import Types from "@/store/Types";
import { v4 as uuidv4 } from "uuid";
import wu from "wu";
import AstNode from "./AstNode";
import Attribute from "./Attribute";

interface Relationship {
  organId: string;
  superorganismId: string;
}

export default class Organism {
  private static organisms = [] as Organism[];
  private static organs = [] as Relationship[];
  private static rootOrganism = null as any;

  public storetype = "Organism";
  public id = uuidv4();
  public name!: string;
  public metaorganismId!: string;

  private constructor() {}

  // --- ACTIONS ---

  deserialize(store) {
    Object.assign(this, store);
  }

  public static createWithoutAttributes(
    name: string,
    metaorganism: Metaorganism
  ) {
    const organism = new Organism();
    organism.name = name ?? organism.id;
    organism.metaorganismId = metaorganism.id;
    this.organisms.push(organism);
    return organism;
  }

  public static create(name: string, metaorganism: Metaorganism) {
    const organism = this.createWithoutAttributes(name, metaorganism);
    for (const metaattribute of metaorganism.attributes) {
      const attribute = Attribute.createEditable(
        organism,
        metaattribute.name,
        metaattribute.type ?? Types.Number
      );
      if (metaattribute.default !== undefined) {
        attribute.assignNumber(metaattribute.default);
      }

      if (metaattribute.type === Types.Vector) {
        attribute.assign(AstNode.createVector());
      }
    }

    if (metaorganism.name !== "TheVoid") {
      const clones = Attribute.createEditable(organism, "clones");
      Attribute.createEmergent(organism, "cloneNumber");
      Attribute.createEmergent(organism, "cloneNumber01");
      Attribute.createEmergent(organism, "radialCloneNumber01");
      clones.assignNumber(1);
    }

    return organism;
  }

  destroyDeep(organism) {
    console.assert(organism !== Organism.rootOrganism);

    for (const attribute of Attribute.getAttributesForOrganism(organism)) {
      attribute.destroyDeep();
    }
    for (const organ of this.getChildren(organism)) {
      this.remove(organ);
    }
    this.organs = wu(this.organs)
      .reject(
        (t) => t.organId === organism.id || t.superorganismId === organism.id
      )
      .toArray();
    this.organisms = wu(this.organisms)
      .reject((t) => t.id === organism.id)
      .toArray();
  }

  spawn() {
    const metacircle = this.root.metaorganismCollection.getFromName("Circle");
    const organism = this.putFromMeta(null, metacircle);
    organism.name = organism.id;
    return organism;
  }

  createFromMetaname(name, metaname: string) {
    const metaorganism = this.root.metaorganismCollection.getFromName(metaname);
    return this.create(name, metaorganism);
  }

  addChild(superorganism, organ) {
    console.assert(organ);
    console.assert(superorganism);
    this.organs = wu(this.organs)
      .reject((t) => t.organId === organ.id)
      .toArray();
    this.organs.push({ superorganismId: superorganism.id, organId: organ.id });
    return organ;
  }

  getChildren(superorganism) {
    const organEntries = wu(this.organs).filter(
      (t) => t.superorganismId === superorganism.id
    );
    return organEntries.map((t) => this.getOrganismFromId(t.organId));
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
    const answer = this.putFromMetaWithoutAttributes(
      name,
      this.root.metaorganismCollection.getFromName("SuperOrganism")
    );
    console.assert(answer);
    return answer;
  }

  initRootOrganism() {
    if (this.rootOrganism) return;

    this.rootOrganism = this.putFromMetaname("The Void", "TheVoid");
    Attribute.createEmergent(this.rootOrganism, "time");
    Attribute.createEmergent(this.rootOrganism, "time01");
    Attribute.createEmergent(this.rootOrganism, "window.height");
    Attribute.createEmergent(this.rootOrganism, "window.width");
    Attribute.createEmergent(this.rootOrganism, "window.center", Types.Vector);
    return this.rootOrganism;
  }

  getFromName(name) {
    return wu(this.organisms).find((organism) => organism.name === name);
  }

  getOrganisms() {
    return this.organisms;
  }

  getOrganismFromId(organismId): Organism {
    const organism = wu(this.organisms).find((row) => row.id === organismId);
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
      organism = children.find((t) => t?.name === organismName);
      console.assert(organism);
    }
    return organism;
  }

  *getAncestors(organism) {
    console.assert(organism);
    while (true) {
      organism = this.getSuper(organism);
      if (organism === undefined) return;
      yield organism;
    }
  }

  getSuper(organism: Organism): Organism | undefined {
    const superorganismId = this.organs.find((t) => t.organId === organism.id)
      ?.superorganismId;
    if (!superorganismId) {
      console.assert(organism.id === this.rootOrganism.id);
      return undefined;
    }
    return this.getOrganismFromId(superorganismId);
  }

  getRoot(): Organism {
    return this.rootOrganism;
  }
}
