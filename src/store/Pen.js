import wu from "wu";
import { RootStore } from './Root';
import Functions from '../code/Functions';

export default class Pen {
  /**
   * @param {RootStore} rootStore 
   */
  constructor(rootStore) {
    this.rootStore = rootStore;
    
    this.replacementSuggestions = [];
    this.pointedNode = null;
    this.query = '';
    
    this.isQuerying = false;
  }

  get nodeStore() {
    return this.rootStore.nodeStore;
  }

  // --- GETS ---

  getReplacementSuggestions() {
    return wu(this.replacementSuggestions);
  }

  getIsQuerying() {
    return this.isQuerying;
  }

  getSerialized() {
    return {};
  }

  getQuery() {
    return this.query;
  }

  getPointedNode() {
    return this.pointedNode;
  }

  // --- ACTIONS ---

  deserialize(store) {
    Object.assign(this, store);
  }

  setIsQuerying(isQuerying) {
    this.isQuerying = isQuerying;
    if (!isQuerying) {
      this.replacementSuggestions = [];
      this.setQuery('');
    }
  }

  setPointedNode(node) {
    this.pointedNode = node;
    this.setIsQuerying(false);
  }

  setQuery(query) {
    this.query = query;
    this.replacementSuggestions = [];

    if (this.pointedNode === null) return;
   
    // --- number ---

    const number = Number.parseFloat(this.query);
    if (!Number.isNaN(number)) {
      this.replacementSuggestions.push({
        text: number.toString(),
        addNodeFunction: () => this.nodeStore.addNumber(number),
      });
      return;
    }

    // --- attributes ---

    const pointedAttribute = this.rootStore.attributeStore.getAttributeForNode(this.pointedNode);
    const organism = this.rootStore.attributeStore.getOrganismForAttribute(pointedAttribute);
    const attributes = this.rootStore.attributeStore.getAttributesForOrganism(organism);

    for (const attribute of attributes) {
      console.assert(attribute);
      const isSubsequence = Functions.isSubsequence(query.toLowerCase(), attribute.name.toLowerCase());
      const ok = 
          attribute !== pointedAttribute &&
          (query === '' || isSubsequence);
      if (!ok) continue;

      const rootNode = this.rootStore.attributeStore.getRootNode(attribute);
      this.replacementSuggestions.push({
        text: attribute.name,
        addNodeFunction: () => this.nodeStore.addReference(rootNode),
      });
    }

    // --- functions ---

    for (const fun of this.rootStore.metafunStore.getFuns()) {
      const isSubsequence = Functions.isSubsequence(query.toLowerCase(), fun.name.toLowerCase());
      const ok = query === '' || isSubsequence;
      if (!ok) continue;

      this.replacementSuggestions.push({
        text: fun.name,
        addNodeFunction: () => this.nodeStore.addFun(fun),
      });
    }
  }

  commitSuggestion(suggestion) {
    const { parentNode, childIndex } = this.nodeStore.getParentRelationship(this.pointedNode);
    console.assert(parentNode);
    console.assert(childIndex !== undefined);

    const child = suggestion.addNodeFunction();
    this.nodeStore.putChild(parentNode, childIndex, child);

    this.setPointedNode(child);
  }

  moveCursorLeft() {
    if (this.getPointedNode() === null) return;
    
    const nodeStore = this.rootStore.nodeStore;
    const traverse = Functions.traverseLeft(
        this.getPointedNode(),
        node => this.nodeStore.getParent(node, false),
        node => nodeStore.getChildren(node));
    const node = traverse.next().value;
    if (node && !this.rootStore.attributeStore.isRootNode(node)) {
      this.setPointedNode(node);
    }
  }

  moveCursorRight() {
    if (this.getPointedNode() === null) return;

    const nodeStore = this.rootStore.nodeStore;
    const traverse = Functions.traverseRight(
        this.getPointedNode(),
        node => this.nodeStore.getParent(node, false),
        node => nodeStore.getChildren(node));
    const node = traverse.next().value;
    if (node) {
      this.setPointedNode(node);
    }
  }
}