import wu from "wu";
import { MetanodesByName } from "../code/Metanodes";
import { v4 as uuidv4 } from 'uuid';

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

  getParent(node) {
    const row = wu(this.nodeParents).find(entry => entry.childNodeId === node.id);
    console.assert(row, 'no parent');
    return this.getFromId(row.parentNodeId);
  }

  getChild(node, childIndex) {
    const row = wu(this.nodeParents)
        .find(entry => entry.parentNodeId === node.id && entry.childIndex === childIndex);
    console.assert(row, 'no child');
    return this.getFromId(row.childNodeId);
  }

  getFromId(nodeId) {
    const answer = wu(this.nodes).find(node => node.id === nodeId);
    console.assert(answer, 'cant find node from id');
    return answer;
  }

  // --- ACTIONS ---

  create(metanode, args) {
    if (args === undefined) args = [];

    const answer = {
      metaname: metanode.name,
      id: uuidv4(),
      storetype: 'node',
    };

    if (metanode.metatype === 'Function') {
      for (let i = 0; i < metanode.params.length; i++) {
        const param = metanode.params[i];
        const child = this.create(MetanodesByName.get('Number'));
        this.putChild(answer, i, child);
      }
      answer.children = metanode.params.map(param => MetanodesByName.get('Number'));
    } else if (metanode.metatype === 'Value') {
      answer.value = args[0] ?? metanode.defaultValue;
    } else if (metanode.name === 'Variable') {
      const child = this.create(MetanodesByName.get('Number'));
      this.putChild(answer, 0, child);
    } else if (metanode.name === 'Reference') {
      answer.target = args[0] ?? null;
    }

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
    return child;
  }

  eval(node) {
    const metanode = MetanodesByName.get(node.metaname);
    if (metanode.metatype === 'Function') {
      return metanode.eval(...node.children);
    } else {
      return metanode.eval(node);
    }
  }
}
