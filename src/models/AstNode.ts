import wu from "wu";
import Collection from "@/code/Collection";
import Types from "@/store/Types";
import { v4 as uuidv4 } from "uuid";
import Attribute from "./Attribute";

interface Relationship {
  childNodeId: string;
  parentNodeId: string;
  childIndex: number;
}

export default class AstNode {
  public storetype = "node";
  public id = uuidv4();
  public metaname!: string;
  public datatype!: Types;
  public eval!: Function;

  private static nodes = new Collection<AstNode>([], ["id"]);
  private static relationships = new Collection<Relationship>(
    ["parentNodeId"],
    ["childNodeId"]
  );

  private constructor() {}

  public static createNumber(value) {
    const answer = this.create("Number", Types.Number) as any;
    answer.value = value;
    answer.eval = () => answer.value;
    return answer;
  }

  public static createVector(x = 0, y = 0) {
    const answer = this.create("Vector", Types.Vector);
    answer.putChild(0, this.createNumber(x));
    answer.putChild(1, this.createNumber(y));
    answer.eval = () => ({
      x: answer.getChild(0).eval(),
      y: answer.getChild(1).eval(),
    });
    return answer;
  }

  public static createVariable(datatype = Types.Number) {
    const answer = this.create("Variable", datatype) as any;
    if (datatype === Types.Number) {
      answer.putChild(0, this.createNumber(0));
    } else if (datatype === Types.Vector) {
      answer.putChild(0, this.createVector());
    } else {
      console.assert(false);
    }
    answer.eval = () => answer.getChild(0).eval();
    return answer;
  }

  public static createReference(targetNode) {
    const answer = this.create("Reference", targetNode.datatype) as any;
    answer.targetNodeId = targetNode.id;
    answer.eval = () => AstNode.getFromId(answer.targetNodeId).eval();
    return answer;
  }

  public static createFun(metafun, outputType = Types.Number) {
    const answer = this.create("Function", outputType) as any;
    const inputTypes = metafun.inputTypesFromOutputType?.(outputType);
    const hasTypeFun = metafun.inputTypesFromOutputType !== undefined;
    console.assert(!hasTypeFun || inputTypes !== undefined);

    for (let i = 0; i < metafun.paramCount; i++) {
      if (inputTypes === undefined || inputTypes[i] === Types.Number) {
        answer.putChild(i, this.createNumber(0));
      } else if (inputTypes[i] === Types.Vector) {
        answer.putChild(i, this.createVector());
      } else {
        console.assert(false, inputTypes[i]);
      }
    }

    answer.metafunName = metafun.name;
    answer.eval = () => metafun.eval(...answer.getChildren());
    return answer;
  }

  public static reseed() {
    this.nodes.clear();
    this.relationships.clear();
  }

  public static getFromId(nodeId) {
    const answer = this.nodes.getUnique("id", nodeId);
    console.assert(answer as any, "cant find node from id");
    return answer;
  }

  public putChild(childIndex: number, child: AstNode) {
    console.assert(child as any);
    const parent = this;

    // check child doesn't already have parent
    if (
      wu(AstNode.relationships).find((row) => row.childNodeId === child.id) !==
      undefined
    ) {
      throw new Error();
    }

    const oldChildRelationships = AstNode.relationships.getMany(
      "parentNodeId",
      parent.id
    );
    const oldChildRelationship = oldChildRelationships.find(
      (t) => t.childIndex === childIndex
    );

    if (oldChildRelationship !== undefined) {
      const oldChild = AstNode.getFromId(oldChildRelationship.childNodeId);
      oldChild.destroyDeep();
    }

    for (const parentRelationship of AstNode.relationships) {
      console.assert(
        !(
          parentRelationship.parentNodeId === parent.id &&
          parentRelationship.childIndex === childIndex
        )
      );
    }
    AstNode.relationships.add({
      childNodeId: child.id,
      parentNodeId: parent.id,
      childIndex: childIndex,
    });
    console.assert(parent.id);
    console.assert(child.id);
    console.assert(childIndex !== undefined);
    return child;
  }

  public destroyDeep(shouldAssert = true) {
    for (const child of this.getChildren()) {
      child.destroyDeep(shouldAssert);
    }
    const relation = AstNode.relationships.getUnique(
      "childNodeId",
      this.id,
      shouldAssert
    );
    if (relation) {
      AstNode.relationships.delete(relation);
    }
    AstNode.nodes.delete(this);
  }

  public deserialize() {}

  public getChild(childIndex: number): AstNode {
    const ret = this.getChildMaybe(childIndex);
    console.assert(ret as any);
    return ret as any;
  }

  public getChildMaybe(childIndex) {
    const parentRelationships = AstNode.relationships.getMany(
      "parentNodeId",
      this.id
    );
    const row = wu(parentRelationships).find(
      (entry) => entry.childIndex === childIndex
    ) as Relationship;

    if (row === undefined) {
      return undefined;
    } else {
      return AstNode.getFromId(row.childNodeId);
    }
  }

  public getChildren() {
    const parentRelationships = Array.from(
      AstNode.relationships.getMany("parentNodeId", this.id)
    );
    parentRelationships.sort((a, b) => a.childIndex - b.childIndex);
    for (let index = 0; index < parentRelationships.length; index++) {
      const row = parentRelationships[index];
      console.assert(row.childIndex === index);
    }
    const children = wu(parentRelationships).map((row) =>
      AstNode.getFromId(row.childNodeId)
    );
    return children;
  }

  public getTargetNodeForReference(referenceNode) {
    const node = AstNode.getFromId(referenceNode.targetNodeId);
    console.assert(node as any);
    return node;
  }

  toTree(node) {
    if (node.metaname === "Number") {
      return node.value;
    } else if (node.metaname === "Reference") {
      const target = this.getTargetNodeForReference(node);
      const attribute = Attribute.getAttributeForNode(target);
      return `Reference ${attribute.name}`;
    }

    const children = this.getChildren(node).toArray();
    if (children.length === 1) {
      const child = children[0];
      if (child.metaname === "Number" || child.metaname === "Reference") {
        return this.toTree(child);
      }
    }

    const tree = {};
    for (const child of children) {
      tree[child.metaname] = this.toTree(child);
    }
    return tree;
  }

  /**
   * @param nodePath [] returns the Var root
   */
  public getFromPath(
    organismPath: string[],
    attributeName,
    nodePath: number[] = []
  ) {
    const organism = this.root.organismCollection.getOrganismFromPath(
      ...organismPath
    );
    let node = Attribute.getRootNodeFromName(organism, attributeName);
    for (const childIndex of nodePath) {
      node = node.getChild(childIndex);
    }
    console.assert(node);
    return node;
  }

  public getParent(node, shouldAssert = true) {
    if (shouldAssert === undefined) shouldAssert = true;

    const parentRelationship = AstNode.relationships.getUnique(
      "childNodeId",
      node.id,
      shouldAssert
    );
    if (shouldAssert) {
      console.assert(parentRelationship as any, "no parent");
    }
    if (parentRelationship === undefined) {
      return undefined;
    } else {
      return AstNode.getFromId(parentRelationship.parentNodeId);
    }
  }

  private static create(metaname: string, datatype: Types) {
    const node = new AstNode();
    node.metaname = metaname;
    node.datatype = datatype;
    return node;
  }

  private getParentRelationship(childNode, shouldAssert = true) {
    const row = AstNode.relationships.getUnique(
      "childNodeId",
      childNode.id,
      shouldAssert
    );
    if (!row) {
      if (shouldAssert) console.assert(row);
      return null;
    }
    return {
      parentNode: AstNode.getFromId(row.parentNodeId),
      childIndex: row.childIndex,
    };
  }
}
