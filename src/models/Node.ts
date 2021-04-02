import wu from "wu";
import { v4 as uuidv4 } from "uuid";
import Root from "@/store/Root";
import Functions from "../code/Functions";
import Collection from "@/code/Collection";
import Type, { Primitive } from "./Type";
import Attribute from "@/models/Attribute";
import Metastruct from "@/models/Metastruct";

interface ParentRelationship {
  childNodeId: string;
  parentNodeId: string;
  childIndex: number;
}

export default class Node {
  public id = uuidv4();
  public metaname!: string;
  public storetype = "node";
  public datatypeId!: string;

  public get datatype() {
    return Type.fromId(this.datatypeId);
  }

  public set datatype(value) {
    this.datatypeId = value.id;
  }

  static nodes = new Collection<any>([], ["id"]);
  static nodeParents = new Collection<ParentRelationship>(
    ["parentNodeId"],
    ["childNodeId"]
  );

  public static root = Root;

  private constructor() {}

  // --- GETS ---

  static getSerialized() {
    return {
      nodeParents: this.nodeParents.serialize(),
      nodes: this.nodes.serialize()
    };
  }

  static getParent(node, shouldAssert = true) {
    if (shouldAssert === undefined) shouldAssert = true;

    const parentRelationship = this.nodeParents.getUnique(
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
      return this.getFromId(parentRelationship.parentNodeId);
    }
  }

  static getChild(node, childIndex) {
    const ret = this.getChildMaybe(node, childIndex);
    console.assert(ret);
    return ret;
  }

  static getChildMaybe(node, childIndex) {
    const parentRelationships = this.nodeParents.getMany(
      "parentNodeId",
      node.id
    );
    const row = wu(parentRelationships).find(
      entry => entry.childIndex === childIndex
    ) as ParentRelationship;

    if (row === undefined) {
      return undefined;
    } else {
      return this.getFromId(row.childNodeId);
    }
  }

  static getChildren(node) {
    const parentRelationships = Array.from(
      this.nodeParents.getMany("parentNodeId", node.id)
    );
    parentRelationships.sort((a, b) => a.childIndex - b.childIndex);
    for (let index = 0; index < parentRelationships.length; index++) {
      const row = parentRelationships[index];
      console.assert(row.childIndex === index);
    }
    const children = wu(parentRelationships).map(row =>
      this.getFromId(row.childNodeId)
    );
    return children;
  }

  static getFromId(nodeId): any {
    const answer = this.nodes.getUnique("id", nodeId);
    console.assert(answer, "cant find node from id");
    return answer;
  }

  static getParentRelationship(childNode, shouldAssert = true) {
    const row = this.nodeParents.getUnique(
      "childNodeId",
      childNode.id,
      shouldAssert
    );
    if (!row) {
      if (shouldAssert) console.assert(row);
      return null;
    }
    return {
      parentNode: this.getFromId(row.parentNodeId),
      childIndex: row.childIndex
    };
  }

  static getTargetNodeForReference(referenceNode) {
    const node = this.getFromId(referenceNode.targetNodeId);
    console.assert(node);
    return node;
  }

  static toTree(node) {
    if (node.metaname === "Number") {
      return node.value;
    } else if (node.metaname === "Reference") {
      const target = this.getTargetNodeForReference(node);
      const attribute = this.root.attributeCollection.getAttributeForNode(
        target
      );
      return `Reference ${attribute!.name}`;
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
  static getFromPath(
    organismPath: string[],
    attributeName,
    nodePath: number[] = []
  ) {
    const organism = this.root.organismCollection.getOrganismFromPath(
      ...organismPath
    );
    let node = this.root.attributeCollection.getRootNodeFromName(
      organism,
      attributeName
    );
    for (const childIndex of nodePath) {
      node = this.getChild(node, childIndex);
    }
    console.assert(node);
    return node;
  }

  // --- ACTIONS ---

  static deserialize(store) {
    this.nodeParents.deserialize(store.nodeParents);
    this.nodes.deserialize(store.nodes, Node);

    for (const node of this.nodes) {
      if (node.metaname === "Number") {
        node.eval = () => node.value;
      } else if (node.metaname === "Variable") {
        node.eval = () => this.getChild(node, 0).eval();
      } else if (node.metaname === "Reference") {
        node.eval = () => this.getFromId(node.targetNodeId).eval();
      } else if (node.metaname === "Function") {
        const metafun = this.root.metafunStore.getFromName(
          node.metafunName
        ) as any;
        node.eval = () => metafun.eval(...this.getChildren(node));
      } else if (node.metaname === "Struct") {
        node.eval = () => this.evalStruct(node);
      } else if (node.metaname === "Void") {
        node.eval = () => undefined;
      } else {
        console.assert(false);
      }
    }
  }

  static addNumber(value) {
    const answer = this.addNode("Number", Primitive.Number) as any;
    answer.value = value;
    answer.eval = () => answer.value;
    return answer;
  }

  static addVariable(datatype = Primitive.Number as Type) {
    const answer = this.addNode("Variable", datatype) as any;
    if (datatype === Primitive.Number) {
      this.putChild(answer, 0, this.addNumber(0));
    } else if (datatype instanceof Metastruct) {
      this.putChild(answer, 0, this.addStruct(datatype));
    } else if (datatype === Primitive.Undetermined) {
      this.putChild(answer, 0, this.addVoid());
    } else {
      console.assert(false);
    }
    answer.eval = () => this.getChild(answer, 0).eval();
    return answer;
  }

  static addReference(targetNode) {
    console.assert(targetNode.datatype !== Primitive.Undetermined);
    const answer = this.addNode("Reference", targetNode.datatype) as any;
    answer.targetNodeId = targetNode.id;
    answer.eval = () => this.getFromId(answer.targetNodeId).eval();
    return answer;
  }

  static addFun(metafun, outputType = Primitive.Number) {
    const answer = this.addNode("Function", outputType) as any;
    const inputTypes = metafun.inputTypesFromOutputType?.(outputType);
    const hasTypeFun = metafun.inputTypesFromOutputType !== undefined;
    console.assert(!hasTypeFun || inputTypes !== undefined);

    for (let i = 0; i < metafun.paramCount; i++) {
      if (inputTypes === undefined || inputTypes[i] === Primitive.Number) {
        this.putChild(answer, i, this.addNumber(0));
      } else if (inputTypes[i] instanceof Metastruct) {
        this.putChild(answer, i, this.addStruct(inputTypes[i]));
      } else {
        console.assert(false, inputTypes[i]);
      }
    }

    answer.metafunName = metafun.name;
    answer.eval = () => metafun.eval(...this.getChildren(answer));
    return answer;
  }

  static addStruct(metastruct: Metastruct) {
    const answer = this.addNode("Struct", metastruct) as any;
    answer.metastructId = metastruct.id;
    for (let i = 0; i < metastruct.members.length; i++) {
      const member = metastruct.members[i];
      if (member.type === Primitive.Number) {
        this.putChild(answer, i, this.addNumber(0));
      } else if (member.type instanceof Metastruct) {
        this.putChild(answer, i, this.addStruct(member.type));
      } else {
        console.assert(false);
      }
    }
    answer.eval = () => this.evalStruct(answer);
    return answer;
  }

  private static addVoid() {
    const ret = this.addNode("Void", Primitive.Undetermined) as any;
    ret.eval = () => undefined;
    return ret;
  }

  static addNode(metaname, datatype: Type) {
    const answer = new Node();
    answer.metaname = metaname;
    answer.datatypeId = datatype.id;
    this.nodes.add(answer);
    return answer;
  }

  private static evalStruct(node) {
    const metastruct = Metastruct.fromId(node.metastructId);
    const ret = {};
    for (let i = 0; i < metastruct.members.length; i++) {
      const member = metastruct.members[i];
      ret[member.name] = this.getChild(node, i).eval();
    }
    return ret;
  }

  static putChild(parent, childIndex: number, child) {
    console.assert(child);

    // check child doesn't already have parent
    if (
      wu(this.nodeParents).find(row => row.childNodeId === child.id) !==
      undefined
    ) {
      throw new Error();
    }

    const oldChildRelationships = this.nodeParents.getMany(
      "parentNodeId",
      parent.id
    );
    const oldChildRelationship = oldChildRelationships.find(
      t => t.childIndex === childIndex
    );

    if (oldChildRelationship !== undefined) {
      const oldChild = this.getFromId(oldChildRelationship.childNodeId);
      this.remove(oldChild);
    }

    for (const parentRelationship of this.nodeParents) {
      console.assert(
        !(
          parentRelationship.parentNodeId === parent.id &&
          parentRelationship.childIndex === childIndex
        )
      );
    }
    this.nodeParents.add({
      childNodeId: child.id,
      parentNodeId: parent.id,
      childIndex: childIndex
    });
    console.assert(parent.id);
    console.assert(child.id);
    console.assert(childIndex !== undefined);
    return child;
  }

  static commitReplacementSuggestion(suggestion) {
    suggestion.commitFunction();
  }

  static remove(node, shouldAssert = true) {
    for (const child of this.getChildren(node)) {
      this.remove(child, shouldAssert);
    }
    const relation = this.nodeParents.getUnique(
      "childNodeId",
      node.id,
      shouldAssert
    );
    if (relation) {
      this.nodeParents.delete(relation);
    }
    this.nodes.delete(node);
  }

  /**
   * Detaches the child from its old parent, and puts it under the new parent.
   */
  static reparent(
    { child, newParent, childIndex },
    shouldHaveOldParent = true
  ) {
    const relation = this.nodeParents.getUnique(
      "childNodeId",
      child.id,
      shouldHaveOldParent
    );
    if (relation !== undefined) {
      this.nodeParents.delete(relation);
    }
    this.putChild(newParent, childIndex, child);
  }

  static insertNodeAsParent(postChild, postParent) {
    const priorRelation = this.getParentRelationship(postChild);
    if (priorRelation) {
      const { childIndex, parentNode } = priorRelation;
      // move old under new
      this.reparent({
        child: postChild,
        newParent: postParent,
        childIndex: 0
      });

      // move new under old root
      this.reparent(
        {
          child: postParent,
          newParent: parentNode,
          childIndex: childIndex
        },
        false
      );
    }
  }

  /**
   * Removes oldNode and its children from the tree, putting newNode in its place.
   */
  static replaceNode(oldNode, newNode) {
    const parentRelationship = this.getParentRelationship(oldNode);
    console.assert(parentRelationship !== undefined);
    if (parentRelationship) {
      const { childIndex, parentNode } = parentRelationship;
      this.putChild(parentNode, childIndex, newNode);
    }
  }

  static convertToAttribute(node) {
    if (node === null) return;

    const oldAttribute = Attribute.getAttributeForNode(node);
    const organism = oldAttribute.getOrganism();
    const newAttribute = Attribute.putEditable(
      organism,
      Attribute.rootStore.wordCollection.getRandomWord(),
      node.datatype
    );

    const parentNode = this.getParent(node);
    const variableNode = newAttribute.getRootNode();
    const referenceNode = this.addReference(variableNode);
    this.reparent({ child: node, newParent: variableNode, childIndex: 0 });
    this.putChild(parentNode, 0, referenceNode);
    console.log("done");
  }

  static fromTree(subtree, parentNode = undefined): any {
    let rootNode = null;

    for (const [key, value] of wu.entries(subtree)) {
      const parts = key.split(" ");
      const [index, metaname] = parts;
      if (metaname === "Function") {
        const funName = parts[2];

        const node = this.addFun(this.root.metafunStore.getFromName(funName));

        if (parentNode) {
          this.putChild(parentNode, Number.parseInt(index), node);
        }

        if (!parentNode) {
          rootNode = node;
        }

        this.fromTree(value, node);
      } else if (metaname === "Number") {
        const node = this.addNumber(value);
        if (parentNode) {
          this.putChild(parentNode, Number.parseInt(index), node);
        }
      }
    }

    return rootNode;
  }

  static toTree2(subrootNode, subtree = {}) {
    const parentRelationship = this.getParentRelationship(subrootNode, false);
    const childIndex = parentRelationship?.childIndex ?? 0;

    if (subrootNode.metaname === "Function") {
      const childTree = {};
      // childTree.metadata = subrootNode;

      subtree[
        `${childIndex} ${subrootNode.metaname} ${subrootNode.metafunName}`
      ] = childTree;
      for (const childNode of this.getChildren(subrootNode)) {
        this.toTree2(childNode, childTree);
      }
    } else if (subrootNode.metaname === "Number") {
      // subtree[`${childIndex} ${subrootNode.metaname}`] = subrootNode;
      subtree[`${childIndex} ${subrootNode.metaname}`] = subrootNode.value;
    } else if (
      subrootNode.metaname === "Variable" ||
      subrootNode.metaname === "Struct"
    ) {
      const childTree = {};
      // childTree.metadata = subrootNode;

      subtree[`${childIndex} ${subrootNode.metaname}`] = childTree;
      for (const childNode of this.getChildren(subrootNode)) {
        this.toTree2(childNode, childTree);
      }
    }

    return subtree;
  }
}
