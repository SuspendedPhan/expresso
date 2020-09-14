import wu from 'wu';
import { v4 as uuidv4 } from 'uuid';
import { MetanodesByName } from '../code/Metanodes';
import { RootStore } from './Root';

const makeEditableAttribute = (name) => ({
  name,
  id: uuidv4(),
});

/**
 * 
 * @param {RootStore} rootStore
 */
export default class AttributeStore {
  /**
   * @param {RootStore} rootStore 
   */
  constructor(rootStore) {
    this.rootStore = rootStore;
    this.computedAttributes = [];
    this.editableAttributes = [];
    
    
    /** { childAttributeId, parentEntityId } */
    this.attributeParents = [];

    /** { attributeId, rootNodeId } */
    this.rootNodes = [];
  }

  get nodeStore() {
    return this.rootStore.nodeStore;
  }

  getParent(attribute) {
    const answer = wu(this.attributeParents).find(row => row.childAttributeId === attribute);
    console.assert(answer, 'prop has no parent entity');
    return answer;
  }

  getRootNode(attribute) {
    const row = wu(this.rootNodes).find(row => row.attributeId === attribute.id);
    console.assert(row, 'has root node');
    
    return this.rootStore.nodeStore.getFromId(row.rootNodeId);
  }

  putEditable(entity, attributeName) {
    const answer = makeEditableAttribute(attributeName);
    const rootNode = this.nodeStore.addVariable();
    this.editableAttributes.push(answer);
    this.attributeParents.push({ childAttributeId: answer.id, parentEntityId: entity.id });
    this.rootNodes.push({ attributeId: answer.id, rootNodeId: rootNode.id });
    return answer;
  }
};
