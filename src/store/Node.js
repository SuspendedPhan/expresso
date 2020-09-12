import wu from "wu";
import { MetanodesByName } from "../code/Metanodes";
import { v4 as uuidv4 } from 'uuid';

function makeStore() {
  return {
    nodes: [],
    /** {childNodeId, parentNodeId, childIndex} */
    nodeParents: [],
  };
}

function makeGets(root, moduleRoot) {
  return {
    parent(node) {
      const row = wu(moduleRoot.store.nodeParents).find(entry => entry.childNodeId === node.id);
      console.assert(row, 'no parent');
      return this.fromId(row.parentNodeId);
    },

    child(node, childIndex) {
      const row = wu(moduleRoot.store.nodeParents)
          .find(entry => entry.parentNodeId === node.id && entry.childIndex === childIndex);
      console.assert(row, 'no child');
      return this.fromId(row.childNodeId);
    },

    fromId(nodeId) {
      const answer = wu(moduleRoot.store.nodes).find(node => node.id === nodeId);
      console.assert(answer, 'cant find node from id');
      return answer;
    },
  }
}

function makeActions(root, moduleRoot) {
  return {
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

      moduleRoot.store.nodes.push(answer); 
      return answer;
    },

    putChild(parent, childIndex, child) {
      // check child doesn't already have parent
      if (wu(moduleRoot.store.nodeParents)
          .find(row => row.childNodeId === child.id) !== undefined) {
        throw new Error();
      }

      const oldChildRow = wu(moduleRoot.store.nodeParents)
          .find(row => row.parentNodeId === parent.id && row.childIndex === childIndex);

      if (oldChildRow !== undefined) {
        moduleRoot.store.nodes = wu(moduleRoot.store.nodes)
            .reject(node => node.id === oldChildRow.childNodeId).toArray();
        moduleRoot.store.nodeParents = wu(moduleRoot.store.nodeParents)
            .reject(row => row === oldChildRow).toArray();
      }

      moduleRoot.store.nodeParents.push({
        childNodeId: child.id,
        parentNodeId: parent.id,
        childIndex: childIndex,
      });
      console.assert(parent.id);
      return child;
    }
  }
}

export function make(root) {
  const moduleRoot = {};
  moduleRoot.store = makeStore(root);
  moduleRoot.gets = makeGets(root, moduleRoot);
  moduleRoot.actions = makeActions(root, moduleRoot);
  return moduleRoot;
}
