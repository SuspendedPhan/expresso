import wu from "wu";
import { v4 as uuidv4 } from 'uuid';
import { Root } from './Root';
import Functions from "../code/Functions";
import Collection from '@/code/Collection';

// interface suggestion: { text, commitFunction }

export default class NodeStore {

  nodes = new Collection<any>([], ['id']);

  /** {childNodeId, parentNodeId, childIndex} */
  nodeParents = [] as Array<any>;

  constructor(private root: Root) {}

  // --- GETS ---
  
  getSerialized() {
    return {
      nodeParents: this.nodeParents,
      nodes: this.nodes.serialize(),
    };
  }

  getParent(node, shouldAssert = true) {
    if (shouldAssert === undefined) shouldAssert = true;

    const row = wu(this.nodeParents).find(entry => entry.childNodeId === node.id);
    if (shouldAssert) {
      console.assert(row, 'no parent');
    }
    if (row === undefined) {
      return undefined;
    } else {
      return this.getFromId(row.parentNodeId);
    }
  }

  getChild(node, childIndex) {
    const row = wu(this.nodeParents)
        .find(entry => entry.parentNodeId === node.id && entry.childIndex === childIndex);
    console.assert(row, 'no child');
    return this.getFromId(row.childNodeId);
  }

  getChildren(node) {
    const rows = wu(this.nodeParents).filter(row => row.parentNodeId === node.id).toArray();
    rows.sort((a, b) => a.childIndex - b.childIndex);
    for (let index = 0; index < rows.length; index++) {
      const row = rows[index];
      console.assert(row.childIndex === index);
    }
    const children = wu(rows).map(row => this.getFromId(row.childNodeId));
    return children;
  }

  getFromId(nodeId): any {
    // const answer = wu(this.nodes).find(node => node.id === nodeId);
    const answer = this.nodes.getUnique('id', nodeId);
    console.assert(answer, 'cant find node from id');
    return answer;
  }

  getParentRelationship(childNode, shouldAssert = true) {
    const row = wu(this.nodeParents).find(row => row.childNodeId === childNode.id);
    if (!row) {
      if (shouldAssert) console.assert(row);
      return null;
    }
    return {
      parentNode: this.getFromId(row.parentNodeId),
      childIndex: row.childIndex,
    }
  }

  getTargetNodeForReference(referenceNode) {
    const node = this.getFromId(referenceNode.targetNodeId);
    console.assert(node);
    return node;
  }

  toTree(node) {
    if (node.metaname === 'Number') {
      return node.value;
    } else if (node.metaname === 'Reference') {
      const target = this.getTargetNodeForReference(node);
      const attribute = this.root.attributeCollection.getAttributeForNode(target);
      return `Reference ${attribute.name}`;
    }

    const children = this.getChildren(node).toArray();
    if (children.length === 1) {
      const child = children[0];
      if (child.metaname === 'Number' || child.metaname === 'Reference') {
        return this.toTree(child);
      }
    }

    const tree = {};
    for (const child of children) {
      tree[child.metaname] = this.toTree(child);
    }
    return tree;
  }

  getFromPath(organismPath: string[], attributeName, nodePath: number[] = []) {
    const organism = this.root.organismCollection.getOrganismFromPath(...organismPath);
    let node = this.root.attributeCollection.getRootNodeFromName(organism, attributeName);
    for (const childIndex of nodePath) {
      node = this.getChild(node, childIndex);
    }
    console.assert(node);
    return node;
  }

  // --- ACTIONS ---

  deserialize(store) {
    this.nodeParents = store.nodeParents;
    this.nodes.deserialize(store.nodes);
    for (const node of this.nodes) {
      if (node.metaname === 'Number') {
        node.eval = () => node.value;
      } else if (node.metaname === 'Variable') {
        node.eval = () => this.getChild(node, 0).eval();
      } else if (node.metaname === 'Reference') {
        node.eval = () => this.getFromId(node.targetNodeId).eval();
      } else if (node.metaname === 'Function') {
        const metafun = this.root.metafunStore.getFromName(node.metafunName) as any;
        node.eval = () => metafun.eval(...this.getChildren(node));
      }
    }
  }

  addNumber(value) {
    const answer = this.addNode('Number') as any;
    answer.value = value;
    answer.eval = () => answer.value;
    return answer;
  }

  addVariable() {
    const answer = this.addNode('Variable') as any;
    const child = this.addNumber(0);
    this.putChild(answer, 0, child);
    answer.eval = () => this.getChild(answer, 0).eval();
    return answer;
  }

  addReference(targetNode) {
    const answer = this.addNode('Reference') as any;
    answer.targetNodeId = targetNode.id;
    answer.eval = () => this.getFromId(answer.targetNodeId).eval();
    return answer;
  }

  addFun(metafun) {
    const answer = this.addNode('Function') as any;
    for (let i = 0; i < metafun.paramCount; i++) {
      this.putChild(answer, i, this.addNumber(0));
    }
    answer.metafunName = metafun.name;
    answer.eval = () => metafun.eval(...this.getChildren(answer));
    return answer;
  }

  addNode(metaname) {
    const answer = {
      metaname,
      id: uuidv4(),
      storetype: 'node',
    };
    this.nodes.add(answer);
    return answer;
  }

  putChild(parent, childIndex: number, child) {
    console.assert(child);

    // check child doesn't already have parent
    if (wu(this.nodeParents)
        .find(row => row.childNodeId === child.id) !== undefined) {
      throw new Error();
    }

    const oldChildRow = wu(this.nodeParents)
        .find(row => row.parentNodeId === parent.id && row.childIndex === childIndex);

    if (oldChildRow !== undefined) {
      const oldChild = this.getFromId(oldChildRow.childNodeId);
      this.nodes.delete(oldChild);
      this.nodeParents = wu(this.nodeParents)
          .reject(row => row === oldChildRow).toArray();
    }

    this.nodeParents.push({
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

  remove(node) {
    for (const child of this.getChildren(node)) {
      this.remove(child);
    }
    this.nodeParents = wu(this.nodeParents).reject(t => t.childNodeId === node.id || t.parentNodeId === node.id).toArray();
    // this.nodes = wu(this.nodes).reject(t => t.id === node.id).toArray();
    this.nodes.delete(node);
  }

  reparent({ child, parent, childIndex }) {
    this.nodeParents = wu(this.nodeParents).reject(t => t.childNodeId === child.id).toArray();
    this.putChild(parent, childIndex, child);
  }

  insertNodeAsParent(subroot, node) {
    const parentRelationship = this.getParentRelationship(subroot);
    if (parentRelationship) {
      const { childIndex, parentNode } = parentRelationship;
      this.reparent({ child: subroot, parent: node, childIndex: 0 });
      this.reparent({ child: node, parent: parentNode, childIndex: childIndex });
    }
  }

  replaceNode(subroot, node) {
    // memory leak here??
    // what happens when you drop an argument?

    for (const child of this.getChildren(subroot)) {
      const { childIndex } = this.getParentRelationship(child) as any;
      this.reparent({ child: child, parent: node, childIndex });
    }

    const parentRelationship = this.getParentRelationship(subroot);
    if (parentRelationship) {
      const { childIndex, parentNode } = parentRelationship;
      this.putChild(parentNode, childIndex, node);
    }
  }

  fromTree(subtree, parentNode = undefined): any {
    let rootNode = null;

    for (const [key, value] of wu.entries(subtree)) {
      const parts = key.split(' ');
      const [index, metaname] = parts;
      if (metaname === 'Function') {
        const funName = parts[2];

        const node = this.addFun(this.root.metafunStore.getFromName(funName));
        
        if (parentNode) {
          this.putChild(parentNode, Number.parseInt(index), node);
        }
        
        if (!parentNode) {
          rootNode = node;
        }

        this.fromTree(value, node);
      } else if (metaname === 'Number') {

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

    if (subrootNode.metaname === 'Function') {
      const childTree = {};
      
      subtree[`${childIndex} ${subrootNode.metaname} ${subrootNode.metafunName}`] = childTree;
      for (const childNode of this.getChildren(subrootNode)) {
        this.toTree2(childNode, childTree);
      }
    } else if (subrootNode.metaname === 'Number') {
      subtree[`${childIndex} ${subrootNode.metaname}`] = subrootNode.value;
    } else if (subrootNode.metaname === 'Variable') {
      const childTree = {};
      
      subtree[`${childIndex} ${subrootNode.metaname}`] = childTree;
      for (const childNode of this.getChildren(subrootNode)) {
        this.toTree2(childNode, childTree);
      }
    }

    return subtree;
  }
}
