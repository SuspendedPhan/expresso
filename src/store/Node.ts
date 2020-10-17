import wu from "wu";
import { v4 as uuidv4 } from "uuid";
import { Root } from "./Root";
import Functions from "../code/Functions";
import Collection from "@/code/Collection";
import Types from "./Types";

interface ParentRelationship {
  childNodeId: string;
  parentNodeId: string;
  childIndex: number;
}

export default class NodeStore {
  nodes = new Collection<any>([], ["id"]);
  nodeParents = new Collection<ParentRelationship>(
    ["parentNodeId"],
    ["childNodeId"]
  );

  constructor(private root: Root) {}

  // --- GETS ---

  getSerialized() {
    return {
      nodeParents: this.nodeParents.serialize(),
      nodes: this.nodes.serialize(),
    };
  }

  getParent(node, shouldAssert = true) {
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

  getChild(node, childIndex) {
    const ret = this.getChildMaybe(node, childIndex);
    console.assert(ret);
    return ret;
  }

  getChildMaybe(node, childIndex) {
    const parentRelationships = this.nodeParents.getMany(
      "parentNodeId",
      node.id
    );
    const row = wu(parentRelationships).find(
      (entry) => entry.childIndex === childIndex
    ) as ParentRelationship;

    if (row === undefined) {
      return undefined;
    } else {
      return this.getFromId(row.childNodeId);
    }
  }

  getChildren(node) {
    const parentRelationships = Array.from(
      this.nodeParents.getMany("parentNodeId", node.id)
    );
    parentRelationships.sort((a, b) => a.childIndex - b.childIndex);
    for (let index = 0; index < parentRelationships.length; index++) {
      const row = parentRelationships[index];
      console.assert(row.childIndex === index);
    }
    const children = wu(parentRelationships).map((row) =>
      this.getFromId(row.childNodeId)
    );
    return children;
  }

  getFromId(nodeId): any {
    const answer = this.nodes.getUnique("id", nodeId);
    console.assert(answer, "cant find node from id");
    return answer;
  }

  getParentRelationship(childNode, shouldAssert = true) {
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
      childIndex: row.childIndex,
    };
  }

  getTargetNodeForReference(referenceNode) {
    const node = this.getFromId(referenceNode.targetNodeId);
    console.assert(node);
    return node;
  }

  toTree(node) {
    if (node.metaname === "Number") {
      return node.value;
    } else if (node.metaname === "Reference") {
      const target = this.getTargetNodeForReference(node);
      const attribute = this.root.attributeCollection.getAttributeForNode(
        target
      );
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
  getFromPath(organismPath: string[], attributeName, nodePath: number[] = []) {
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

  deserialize(store) {
    this.nodeParents.deserialize(store.nodeParents);
    this.nodes.deserialize(store.nodes);
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
      } else if (node.metaname === "Vector") {
        node.eval = () => ({
          x: this.getChild(node, 0).eval(),
          y: this.getChild(node, 1).eval(),
        });
      } else {
        console.assert(false);
      }
    }
  }

  addNumber(value) {
    const answer = this.addNode("Number", Types.Number) as any;
    answer.value = value;
    answer.eval = () => answer.value;
    return answer;
  }

  addVector(x = 0, y = 0) {
    const answer = this.addNode("Vector", Types.Vector) as any;
    this.putChild(answer, 0, this.addNumber(x));
    this.putChild(answer, 1, this.addNumber(y));
    answer.eval = () => ({
      x: this.getChild(answer, 0).eval(),
      y: this.getChild(answer, 1).eval(),
    });
    return answer;
  }

  addVariable(datatype = Types.Number) {
    const answer = this.addNode("Variable", datatype) as any;
    const child = this.addNumber(0);
    this.putChild(answer, 0, child);
    answer.eval = () => this.getChild(answer, 0).eval();
    return answer;
  }

  addReference(targetNode) {
    const answer = this.addNode("Reference", targetNode.datatype) as any;
    answer.targetNodeId = targetNode.id;
    answer.eval = () => this.getFromId(answer.targetNodeId).eval();
    return answer;
  }

  addFun(metafun, outputType = Types.Number) {
    const answer = this.addNode("Function", outputType) as any;
    const inputTypes = metafun.inputTypesFromOutputType?.(outputType);
    console.assert(metafun.inputTypesFromOutputType || inputTypes);

    for (let i = 0; i < metafun.paramCount; i++) {
      if (inputTypes === undefined || inputTypes[i] === Types.Number) {
        this.putChild(answer, i, this.addNumber(0));
      } else if (inputTypes[i] === Types.Vector) {
        this.putChild(answer, i, this.addVector());
      } else {
        console.assert(false, inputTypes[i]);
      }
    }

    answer.metafunName = metafun.name;
    answer.eval = () => metafun.eval(...this.getChildren(answer));
    return answer;
  }

  addNode(metaname, datatype) {
    const answer = {
      metaname,
      id: uuidv4(),
      storetype: "node",
      datatype,
    };
    this.nodes.add(answer);
    return answer;
  }

  putChild(parent, childIndex: number, child) {
    console.assert(child);

    // check child doesn't already have parent
    if (
      wu(this.nodeParents).find((row) => row.childNodeId === child.id) !==
      undefined
    ) {
      throw new Error();
    }

    const oldChildRelationships = this.nodeParents.getMany(
      "parentNodeId",
      parent.id
    );
    const oldChildRelationship = oldChildRelationships.find(
      (t) => t.childIndex === childIndex
    );

    if (oldChildRelationship !== undefined) {
      const oldChild = this.getFromId(oldChildRelationship.childNodeId);
      this.nodes.delete(oldChild);
      this.nodeParents.delete(oldChildRelationship);
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
      childIndex: childIndex,
    });
    console.assert(parent.id);
    console.assert(child.id);
    console.assert(childIndex !== undefined);
    return child;
  }

  commitReplacementSuggestion(suggestion) {
    suggestion.commitFunction();
  }

  remove(node, shouldAssert = true) {
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
  reparent({ child, newParent, childIndex }, shouldHaveOldParent = true) {
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

  insertNodeAsParent(postChild, postParent) {
    const priorRelation = this.getParentRelationship(postChild);
    if (priorRelation) {
      const { childIndex, parentNode } = priorRelation;
      // move old under new
      this.reparent({
        child: postChild,
        newParent: postParent,
        childIndex: 0,
      });

      // move new under old root
      this.reparent(
        {
          child: postParent,
          newParent: parentNode,
          childIndex: childIndex,
        },
        false
      );
    }
  }

  /**
   * Plucks oldNode from the tree, putting newNode in its place.
   * Also plucks oldNode's children and attaches them to newNode.
   */
  replaceNode(oldNode, newNode) {
    const newNodeChildren = this.getChildren(newNode).toArray();
    const newNodeChildrenCount = newNodeChildren.length;

    const oldNodeChildrenCount = this.getChildren(oldNode).toArray().length;
    if (oldNode.metaname !== "Vector" && newNode.metaname !== "Vector") {
      for (let i = 0; i < oldNodeChildrenCount; i++) {
        const child = this.getChild(oldNode, i);
        if (i < newNodeChildrenCount) {
          this.reparent({
            child: child,
            newParent: newNode,
            childIndex: i,
          });
        } else {
          this.remove(child);
        }
      }
    }

    const parentRelationship = this.getParentRelationship(oldNode);
    console.assert(parentRelationship !== undefined);
    if (parentRelationship) {
      const { childIndex, parentNode } = parentRelationship;
      this.putChild(parentNode, childIndex, newNode);
    }
  }

  fromTree(subtree, parentNode = undefined): any {
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

  toTree2(subrootNode, subtree = {}) {
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
      subrootNode.metaname === "Vector"
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
