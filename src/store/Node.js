import wu from "wu";
import { v4 as uuidv4 } from 'uuid';
import { RootStore } from './Root';
import Functions from "../code/Functions";

// interface suggestion: { text, commitFunction }

export default class NodeStore {
  /**
   * @param {RootStore} rootStore 
   */
  constructor(rootStore) {
    this.rootStore = rootStore;
    this.nodes = [];
    
    /** {childNodeId, parentNodeId, childIndex} */
    this.nodeParents = [];
  }

  // --- GETS ---
  
  getSerialized() {
    return Functions.pluck(this, ['nodes', 'nodeParents']);
  }

  getParent(node, shouldAssert) {
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

  getFromId(nodeId) {
    const answer = wu(this.nodes).find(node => node.id === nodeId);
    console.assert(answer, 'cant find node from id');
    return answer;
  }

  getParentRelationship(childNode) {
    const row = wu(this.nodeParents).find(row => row.childNodeId === childNode.id);
    console.assert(row);
    return {
      parentNode: this.getFromId(row.parentNodeId),
      childIndex: row.childIndex,
    }
  }

  // --- ACTIONS ---

  deserialize(store) {
    Object.assign(this, store);
  }

  addNumber(value) {
    const answer = this.addNode('Number');
    answer.value = value;
    answer.eval = () => answer.value;
    return answer;
  }

  addVariable() {
    const answer = this.addNode('Variable');
    const child = this.addNumber(0);
    this.putChild(answer, 0, child);
    answer.eval = () => this.getChild(answer, 0).eval();
    return answer;
  }

  addReference(targetNode) {
    const answer = this.addNode('Reference');
    answer.targetNodeId = targetNode.id;
    answer.eval = () => this.getFromId(answer.targetNodeId).eval();
    return answer;
  }

  addFun(metafun) {
    const answer = this.addNode('Function');
    for (let i = 0; i < metafun.paramCount; i++) {
      this.putChild(answer, i, this.addNumber(0));
    }
    answer.eval = () => metafun.eval(...this.getChildren(answer));
    return answer;
  }

  addNode(metaname) {
    const answer = {
      metaname,
      id: uuidv4(),
      storetype: 'node',
    };
    this.nodes.push(answer);
    return answer;
  }

  putChild(parent, childIndex, child) {
    // check child doesn't already have parent
    if (wu(this.nodeParents)
        .find(row => row.childNodeId === child.id) !== undefined) {
      throw new Error();
    }

    const oldChildRow = wu(this.nodeParents)
        .find(row => row.parentNodeId === parent.id && row.childIndex === childIndex);

    if (oldChildRow !== undefined) {
      this.nodes = wu(this.nodes)
          .reject(node => node.id === oldChildRow.childNodeId).toArray();
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
}
