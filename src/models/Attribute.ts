import Types from "@/store/Types";
import { v4 as uuidv4 } from "uuid";
import AstNode from "./AstNode";
import wu from "wu";
import Functions from "../code/Functions";

interface OrganismRelationship {
  childAttributeId: string;
  parentOrganismId: string;
}

interface RootNodeRelationship {
  attributeId: string;
  rootNodeId: string;
}

export default class Attribute {
  private static attributes = [] as Array<Attribute>;

  /** { childAttributeId, parentOrganismId } */
  private static organismRelationships = [] as Array<OrganismRelationship>;

  /** { attributeId, rootNodeId } */
  private static rootNodeRelationships = [] as Array<RootNodeRelationship>;

  public name!: string;
  public attributeType!: string;
  public datatype!: Types;
  public storetype = "Attribute";
  public id = uuidv4();

  private constructor() {}

  public static createEditable(
    organism,
    name: string,
    datatype = Types.Number
  ) {
    return this.create(organism, name, 'Editable', datatype);
  }

  public static createEmergent(
    organism,
    name: string,
    datatype = Types.Number
  ) {
    return this.create(organism, name, 'Emergent', datatype);
  }

  private static create(
    organism,
    name: string,
    attributeType: string,
    datatype = Types.Number
  ) {
    const attribute = new Attribute();
    attribute.name = name;
    attribute.attributeType = attributeType;
    attribute.datatype = datatype;
    Attribute.attributes.push(attribute);

    this.organismRelationships.push({
      childAttributeId: attribute.id,
      parentOrganismId: organism.id,
    });

    const rootNode = AstNode.createVariable(datatype);
    this.rootNodeRelationships.push({
      attributeId: attribute.id,
      rootNodeId: rootNode.id,
    });

    return attribute;
  }

  getSerialized() {
    return Functions.pluck(this, [
      "attributes",
      "attributeParents",
      "rootNodes",
    ]);
  }

  getRootNode(): any {
    const row = wu(Attribute.rootNodeRelationships).find(
      (row) => row.attributeId === this.id
    );
    console.assert(row as any, "has root node");

    return AstNode.getFromId(row!.rootNodeId);
  }

  getAttributesForOrganism(organism) {
    console.assert(organism);
    const relationships = wu(Attribute.organismRelationships).filter(
      (row) => row.parentOrganismId === organism.id
    );

    const answer = relationships.map((row) => {
      const attr = Attribute.attributes.find(
        (attr) => attr.id === row.childAttributeId
      );
      console.assert(attr as any);
      return attr as Attribute;
    });
    return answer;
  }

  getEditables(organism) {
    let answer = wu(this.getAttributesForOrganism(organism));
    answer = answer.filter((row) => row.attributeType === "Editable");
    return answer;
  }

  getEmergents(organism) {
    return wu(this.getAttributesForOrganism(organism)).filter(
      (row) => row.attributeType === "Emergent"
    );
  }

  getRootNodeFromName(organism, attributeName, shouldAssert = true) {
    const attribute = this.getAttributeFromName(organism, attributeName);
    if (attribute === undefined) {
      if (shouldAssert ?? true) {
        console.assert(attribute, `couldn't find ${attributeName}`);
      }
      return undefined;
    }
    return this.getRootNode();
  }

  getAttributeFromName(organism, attributeName) {
    const attributes = this.getAttributesForOrganism(organism);
    const attribute = attributes.find((attr) => attr.name === attributeName);
    return attribute;
  }

  getAttributeFromId(attributeId) {
    return Attribute.attributes.find((row) => row.id === attributeId);
  }

  getAttributeForNode(node: AstNode) {
    let root = node;
    while (true) {
      const parent = root.getParent(false);
      if (parent === undefined) break;
      root = parent;
    }
    const row = Attribute.rootNodeRelationships.find(
      (row) => row.rootNodeId === root.id
    );
    console.assert(row as any, "no attribute for root node");
    const attribute = this.getAttributeFromId(row!.attributeId);
    return attribute;
  }

  getOrganism() {
    const row = wu(Attribute.organismRelationships).find(
      (row) => row.childAttributeId === this.id
    );
    console.assert(row as any);
    const organism = this.rootStore.organismStore.getOrganismFromId(
      row!.parentOrganismId
    );
    console.assert(organism !== undefined);
    return organism;
  }

  eval(attribute) {
    return this.getRootNode().eval();
  }

  isRootNode(node: AstNode) {
    const answer = wu(Attribute.rootNodeRelationships)
      .map((row) => row.rootNodeId)
      .has(node.id);
    return answer;
  }

  // --- ACTIONS ---

  deserialize(store) {
    Object.assign(this, store);
  }

  assignNumber(value) {
    this.getRootNode().putChild(0, AstNode.createNumber(value));
  }

  assign(valueNode) {
    this.getRootNode().putChild(0, valueNode);
  }

  destroyDeep(attribute) {
    const rootNode = this.getRootNode();
    rootNode.destroyDeep(false);

    Attribute.attributes = wu(Attribute.attributes)
      .reject((t) => t.id === attribute.id)
      .toArray();
    Attribute.organismRelationships = wu(Attribute.organismRelationships)
      .reject((t) => t.childAttributeId === attribute.id)
      .toArray();
    Attribute.rootNodeRelationships = wu(Attribute.rootNodeRelationships)
      .reject((t) => t.attributeId === attribute.id)
      .toArray();
  }
}
