import wu from 'wu';
import { v4 as uuidv4 } from 'uuid';
import { MetanodesByName } from '../code/Metanodes';
import { RootStore } from './Root';
import Functions from '../code/Functions';

const makeAttribute = (name, attributeType) => ({
  name,
  attributeType,
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
    this.attributes = [];
    
    /** { childAttributeId, parentOrganismId } */
    this.attributeParents = [];

    /** { attributeId, rootNodeId } */
    this.rootNodes = [];
  }

  get nodeStore() {
    return this.rootStore.nodeStore;
  }
  
  // --- GETS ---

  getSerialized() {
    return Functions.pluck(this, [
      'attributes',
      'attributeParents',
      'rootNodes',
    ]);
  }

  getParent(attribute) {
    const answer = wu(this.attributeParents).find(row => row.childAttributeId === attribute);
    console.assert(answer, 'prop has no parent organism');
    return answer;
  }

  getRootNode(attribute) {
    const row = wu(this.rootNodes).find(row => row.attributeId === attribute.id);
    console.assert(row, 'has root node');
    
    return this.rootStore.nodeStore.getFromId(row.rootNodeId);
  }

  getAttributesForOrganism(organism) {
    let answer = wu(this.attributeParents)
        .filter(row => row.parentOrganismId === organism.id);
    answer = answer.map(row => {
      const attr = this.attributes.find(attr => attr.id === row.childAttributeId);
      return attr;
    });
    return answer;
  }

  getEditables(organism) {
    let answer = wu(this.getAttributesForOrganism(organism));
    answer = answer.filter(row => row.attributeType === 'Editable');
    // console.log(answer.toArray());
    return answer;
  }
  
  getEmergents(organism) {
    return wu(this.getAttributesForOrganism(organism)).filter(row => row.attributeType === 'Editable');
  }

  getRootNodeFromName(organism, attributeName) {
    const attribute = this.getAttributeFromName(organism, attributeName);
    // console.assert(attribute);
    return this.getRootNode(attribute);
  }

  getAttributeFromName(organism, attributeName) {
    const attributes = this.getAttributesForOrganism(organism);
    const attribute = attributes.find(attr => attr.name === attributeName);
    return attribute;
  }

  getAttributeFromId(attributeId) {
    return this.attributes.find(row => row.id = attributeId);
  }

  getAttributeForNode(node) {
    let root = node;
    while (true) {
      const parent = this.nodeStore.getParent(root, false);
      if (parent === undefined) break;
      root = parent;
    }
    const row = this.rootNodes.find(row => row.rootNodeId === root.id);
    const attribute = this.getAttributeFromId(row.attributeId);
    return attribute;
  }

  getOrganismForAttribute(attribute) {
    const row = wu(this.attributeParents).find(row => row.childAttributeId === attribute.id);
    console.assert(row);
    const organism = this.rootStore.organismStore.getOrganismFromId(row.parentOrganismId);
    console.assert(organism);
    return organism;
  }

  // --- ACTIONS ---

  deserialize(store) {
    Object.assign(this, store);
  }

  putEditable(organism, attributeName) {
    return this.putAttribute(organism, attributeName, 'Editable');
  }

  putEmergent(organism, attributeName) {
    return this.putAttribute(organism, attributeName, 'Emergent');
  }

  putAttribute(organism, attributeName, attributeType) {
    const answer = makeAttribute(attributeName, attributeType);
    const rootNode = this.nodeStore.addVariable();
    this.attributes.push(answer);
    this.attributeParents.push({ childAttributeId: answer.id, parentOrganismId: organism.id });
    this.rootNodes.push({ attributeId: answer.id, rootNodeId: rootNode.id });
    return answer;
  }
};
