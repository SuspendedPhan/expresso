import wu from "wu";
import { v4 as uuidv4 } from "uuid";
import Root from "../store/Root";
import Functions from "../code/Functions";
import Types from "./Types";

const makeAttribute = (name, attributeType, datatype) => {
  const ret = new Attribute();
  ret.name = name;
  ret.attributeType = attributeType;
  ret.datatype = datatype;
  return ret;
};

/**
 *
 * @param {RootStore} rootStore
 */
export default class Attribute {
  public name!: string;
  public attributeType!: any;
  public datatype!: any;
  public storetype = 'Attribute';
  public id = uuidv4();

  static attributes = [] as Array<Attribute>;

  /** { childAttributeId, parentOrganismId } */
  static attributeParents = [] as Array<any>;

  /** { attributeId, rootNodeId } */
  static rootNodes = [] as Array<any>;

  static rootStore = Root;

  static get nodeStore() {
    return this.rootStore.nodeStore;
  }

  // --- GETS ---

  static getSerialized() {
    return Functions.pluck(this, [
      "attributes",
      "attributeParents",
      "rootNodes",
    ]);
  }

  static getParent(attribute) {
    const answer = wu(this.attributeParents).find(
      (row) => row.childAttributeId === attribute
    );
    console.assert(answer, "prop has no parent organism");
    return answer;
  }

  static getRootNode(attribute): any {
    const row = wu(this.rootNodes).find(
      (row) => row.attributeId === attribute.id
    );
    console.assert(row, "has root node");

    return this.rootStore.nodeStore.getFromId(row.rootNodeId);
  }

  static getAttributesForOrganism(organism) {
    console.assert(organism);
    let answer = wu(this.attributeParents).filter(
      (row) => row.parentOrganismId === organism.id
    );

    answer = answer.map((row) => {
      const attr = this.attributes.find(
        (attr) => attr.id === row.childAttributeId
      );
      console.assert(attr as any);
      return attr;
    });
    return answer;
  }

  static getEditables(organism) {
    let answer = wu(this.getAttributesForOrganism(organism));
    answer = answer.filter((row) => row.attributeType === "Editable");
    return answer;
  }

  static getEmergents(organism) {
    return wu(this.getAttributesForOrganism(organism)).filter(
      (row) => row.attributeType === "Emergent"
    );
  }

  static getRootNodeFromName(organism, attributeName, shouldAssert = true) {
    const attribute = this.getAttributeFromName(organism, attributeName);
    if (attribute === undefined) {
      if (shouldAssert ?? true) {
        console.assert(attribute, `couldn't find ${attributeName}`);
      }
      return undefined;
    }
    return this.getRootNode(attribute);
  }

  static getAttributeFromName(organism, attributeName) {
    const attributes = this.getAttributesForOrganism(organism);
    const attribute = attributes.find((attr) => attr.name === attributeName);
    return attribute;
  }

  static getAttributeFromId(attributeId) {
    return this.attributes.find((row) => row.id === attributeId);
  }

  static getAttributeForNode(node) {
    let root = node;
    while (true) {
      const parent = this.nodeStore.getParent(root, false);
      if (parent === undefined) break;
      root = parent;
    }
    const row = this.rootNodes.find((row) => row.rootNodeId === root.id);
    console.assert(row, "no attribute for root node");
    const attribute = this.getAttributeFromId(row.attributeId);
    return attribute;
  }

  static getOrganismForAttribute(attribute) {
    const row = wu(this.attributeParents).find(
      (row) => row.childAttributeId === attribute.id
    );
    console.assert(row);
    const organism = this.rootStore.organismStore.getOrganismFromId(
      row.parentOrganismId
    );
    console.assert(organism !== undefined);
    return organism;
  }

  static getEvaled(attribute) {
    return this.getRootNode(attribute).eval();
  }

  static isRootNode(node) {
    const answer = wu(this.rootNodes)
      .map((row) => row.rootNodeId)
      .has(node.id);
    return answer;
  }

  // --- ACTIONS ---

  static deserialize(store) {
    Object.assign(this, store);
  }

  static assignNumber(attribute, value) {
    this.nodeStore.putChild(
      this.getRootNode(attribute),
      0,
      this.nodeStore.addNumber(value)
    );
  }

  static assign(attribute, valueNode) {
    this.nodeStore.putChild(this.getRootNode(attribute), 0, valueNode);
  }

  static putEditable(organism, attributeName, datatype = Types.Number) {
    return this.putAttribute(organism, attributeName, "Editable", datatype);
  }

  static putEmergent(organism, attributeName, datatype = Types.Number) {
    return this.putAttribute(organism, attributeName, "Emergent", datatype);
  }

  static putAttribute(organism, attributeName, attributeType, datatype = Types.Number) {
    const answer = makeAttribute(attributeName, attributeType, datatype);
    const rootNode = this.nodeStore.addVariable(datatype);
    this.attributes.push(answer);
    this.attributeParents.push({
      childAttributeId: answer.id,
      parentOrganismId: organism.id,
    });
    this.rootNodes.push({
      attributeId: answer.id,
      rootNodeId: rootNode.id,
    });
    if (datatype === Types.Vector) {
      this.assign(answer, this.nodeStore.addVector());
    }
    return answer;
  }

  static remove(attribute) {
    const rootNode = this.getRootNode(attribute);
    this.rootStore.nodeStore.remove(rootNode, false);

    this.attributes = wu(this.attributes)
      .reject((t) => t.id === attribute.id)
      .toArray();
    this.attributeParents = wu(this.attributeParents)
      .reject((t) => t.childAttributeId === attribute.id)
      .toArray();
    this.rootNodes = wu(this.rootNodes)
      .reject((t) => t.attributeId === attribute.id)
      .toArray();
  }
}
