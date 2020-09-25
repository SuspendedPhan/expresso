import wu from 'wu';
import { v4 as uuidv4 } from 'uuid';
import { Root } from './Root';
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
export default class AttributeCollection {
  attributes = [] as Array<any>;

  /** { childAttributeId, parentOrganismId } */
  attributeParents = [] as Array<any>;

  /** { attributeId, rootNodeId } */
  rootNodes = [] as Array<any>;

  constructor(private rootStore: Root) { }

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

  getRootNode(attribute): any {
    const row = wu(this.rootNodes).find(row => row.attributeId === attribute.id);
    console.assert(row, 'has root node');

    return this.rootStore.nodeStore.getFromId(row.rootNodeId);
  }

  getAttributesForOrganism(organism) {
    console.assert(organism);
    let answer = wu(this.attributeParents)
      .filter(row => row.parentOrganismId === organism.id);

    answer = answer.map(row => {
      const attr = this.attributes.find(attr => attr.id === row.childAttributeId);
      console.assert(attr);
      return attr;
    });
    return answer;
  }

  getEditables(organism) {
    let answer = wu(this.getAttributesForOrganism(organism));
    answer = answer.filter(row => row.attributeType === 'Editable');
    return answer;
  }

  getEmergents(organism) {
    return wu(this.getAttributesForOrganism(organism)).filter(row => row.attributeType === 'Emergent');
  }

  getRootNodeFromName(organism, attributeName, shouldAssert = true) {
    const attribute = this.getAttributeFromName(organism, attributeName);
    if (attribute === undefined) {
      if (shouldAssert ?? true) {
        console.assert(attribute, `couldn't find ${attributeName}`);
      }
      return undefined;
    }
    return this.getRootNode(attribute);
  }

  getAttributeFromName(organism, attributeName) {
    const attributes = this.getAttributesForOrganism(organism);
    const attribute = attributes.find(attr => attr.name === attributeName);
    return attribute;
  }

  getAttributeFromId(attributeId) {
    return this.attributes.find(row => row.id === attributeId);
  }

  getAttributeForNode(node) {
    let root = node;
    while (true) {
      const parent = this.nodeStore.getParent(root, false);
      if (parent === undefined) break;
      root = parent;
    }
    const row = this.rootNodes.find(row => row.rootNodeId === root.id);
    console.assert(row, 'no attribute for root node');
    const attribute = this.getAttributeFromId(row.attributeId);
    return attribute;
  }

  getOrganismForAttribute(attribute) {
    const row = wu(this.attributeParents).find(row => row.childAttributeId === attribute.id);
    console.assert(row);
    const organism = this.rootStore.organismStore.getOrganismFromId(row.parentOrganismId);
    console.assert(organism !== undefined);
    return organism;
  }

  getEvaled(attribute) {
    return this.getRootNode(attribute).eval();
  }

  isRootNode(node) {
    const answer = wu(this.rootNodes).map(row => row.rootNodeId).has(node.id);
    return answer;
  }

  // --- ACTIONS ---

  deserialize(store) {
    Object.assign(this, store);
  }

  assignNumber(attribute, value) {
    this.nodeStore.putChild(this.getRootNode(attribute), 0, this.nodeStore.addNumber(value));
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
