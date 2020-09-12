import wu from 'wu';
import { v4 as uuidv4 } from 'uuid';
import { MetanodesByName } from '../code/Metanodes';
import { RootStore } from './Root';

const makeEditableProperty = (name) => ({
  name,
  id: uuidv4(),
});

/**
 * 
 * @param {RootStore} rootStore
 */
export default class PropertyStore {
  /**
   * @param {RootStore} rootStore 
   */
  constructor(rootStore) {
    this.rootStore = rootStore;
    this.computedProperties = [];
    this.editableProperties = [];
    
    
    /** { childPropertyId, parentEntityId } */
    this.propertyParents = [];

    /** { propertyId, rootNodeId } */
    this.rootNodes = [];
  }

  getParent(property) {
    const answer = wu(this.propertyParents).find(row => row.childPropertyId === property);
    console.assert(answer, 'prop has no parent entity');
    return answer;
  }

  getRootNode(property) {
    const row = wu(this.rootNodes).find(row => row.propertyId === property.id);
    console.assert(row, 'has root node');
    
    return this.rootStore.nodeStore.getFromId(row.rootNodeId);
  }

  putEditable(entity, propertyName) {
    const answer = makeEditableProperty(propertyName);
    const rootNode = this.rootStore.nodeStore.create(MetanodesByName.get('Variable'))
    this.editableProperties.push(answer);
    this.propertyParents.push({ childPropertyId: answer.id, parentEntityId: entity.id });
    this.rootNodes.push({ propertyId: answer.id, rootNodeId: rootNode.id });
    return answer;
  }
};
