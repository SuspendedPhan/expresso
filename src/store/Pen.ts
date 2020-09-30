import wu from "wu";
import { Root } from './Root';
import Functions from '../code/Functions';

interface NonePenPosition {
  positionType: 'None';
}

interface NodePenPosition {
  positionType: 'Node';
  referenceNodeId: string;
  relation: PenPositionRelation;
}

type PenPosition = NonePenPosition | NodePenPosition;

export enum PenPositionRelation {
  On = 'On',
  After = 'After',
  Before = 'Before',
}

export default class Pen {
  replacementSuggestions = [] as Array<any>;
  penPosition = { positionType: 'None' } as PenPosition;
  query = '';
  isQuerying = false;

  constructor(private root: Root) {}

  get nodeStore() {
    return this.root.nodeStore;
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

  getPenPosition() {
    return this.penPosition;
  }

  private getPointedNode() {
    if (this.penPosition.positionType === 'Node') {
      return this.root.nodeStore.getFromId(this.penPosition.referenceNodeId);
    } else {
      return null;
    }
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
    if (node === null) {
      this.penPosition = {
        positionType: 'None',
      };
    } else {
      this.penPosition = {
        positionType: 'Node',
        referenceNodeId: node.id,
        relation: PenPositionRelation.On,
      };
    }
    this.setIsQuerying(false);
  }

  setPenPosition(penPosition: PenPosition) {
    this.penPosition = penPosition;
  }

  setQuery(query) {
    this.query = query;
    this.replacementSuggestions = [];

    if (this.penPosition.positionType === 'None') return;
    if (!this.isQuerying) return;
   
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

    const pointedAttribute = this.root.attributeCollection.getAttributeForNode(this.getPointedNode());
    const pointedOrganism = this.root.attributeCollection.getOrganismForAttribute(pointedAttribute);
    
    const ancestors = this.root.organismCollection.getAncestors(pointedOrganism);
    for (const organism of wu.chain([pointedOrganism], ancestors)) {
      const attributes = this.root.attributeCollection.getAttributesForOrganism(organism);
      for (const attribute of attributes) {
        const isSubsequence = Functions.isSubsequence(query.toLowerCase(), attribute.name.toLowerCase());
        const ok =
          attribute !== pointedAttribute &&
          (query === '' || isSubsequence);
        if (!ok) continue;

        const rootNode = this.root.attributeCollection.getRootNode(attribute);
        this.replacementSuggestions.push({
          text: `${organism.name}.${attribute.name}`,
          addNodeFunction: () => this.nodeStore.addReference(rootNode),
        });
      }
    }

    // --- functions ---

    for (const fun of this.root.metafunStore.getFuns()) {
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
    const { parentNode, childIndex } = this.nodeStore.getParentRelationship(this.getPointedNode());
    console.assert(parentNode !== undefined);
    console.assert(childIndex !== undefined);

    const child = suggestion.addNodeFunction();
    this.nodeStore.putChild(parentNode, childIndex, child);

    this.setPointedNode(child);
    this.moveCursorRight();
  }

  moveCursorLeft() {
    if (this.penPosition.positionType === 'None') return;

    if (this.penPosition.relation === PenPositionRelation.On) {
      this.penPosition.relation = PenPositionRelation.Before;
    } else if (this.penPosition.relation === PenPositionRelation.After) {
      this.penPosition.relation = PenPositionRelation.On;
    } else if (this.penPosition.relation === PenPositionRelation.Before) {
      const nodeStore = this.root.nodeStore;
      const traverse = Functions.traverseLeft(
        this.nodeStore.getFromId(this.penPosition.referenceNodeId),
        (node) => this.nodeStore.getParent(node, false),
        (node) => nodeStore.getChildren(node)
      );
      const node = traverse.next().value;
      if (node && !this.root.attributeCollection.isRootNode(node)) {
        this.penPosition = {
          positionType: 'Node',
          referenceNodeId: node.id,
          relation: PenPositionRelation.On,
        };
      }
    }
  }

  moveCursorRight() {
    if (this.penPosition.positionType === 'None') return;

    if (this.penPosition.relation === PenPositionRelation.Before) {
      this.penPosition.relation = PenPositionRelation.On;
    } else {
      const nodeStore = this.root.nodeStore;
      const traverse = Functions.traverseRight(
        this.getPointedNode(),
        (node) => this.nodeStore.getParent(node, false),
        (node) => nodeStore.getChildren(node)
      );
      const node = traverse.next().value;
      if (node && !this.root.attributeCollection.isRootNode(node)) {
        this.penPosition = {
          positionType: "Node",
          referenceNodeId: node.id,
          relation: PenPositionRelation.Before,
        };
      }
    }
  }

  moveCursorUp() {
    if (this.getPointedNode() === null) {
      const organism = this.root.organismStore.getOrganisms()[0];
      const attr = this.root.attributeStore.getEditables(organism).next().value;
      const rootNode = this.root.attributeStore.getRootNode(attr);
      this.setPointedNode(this.nodeStore.getChild(rootNode, 0));
    } else {
      const attribute = this.root.attributeStore.getAttributeForNode(this.getPointedNode());
      const organism = this.root.attributeStore.getOrganismForAttribute(attribute);
      const attributes = Array.from(this.root.attributeStore.getEditables(organism));
      attributes.reverse();
      const nextAttribute = wu.cycle(attributes).dropWhile(attr => attr !== attribute).drop(1).next().value;
      const node = this.nodeStore.getChild(this.root.attributeStore.getRootNode(nextAttribute), 0);
      this.setPointedNode(node);
    }
  }

  moveCursorDown() {
    if (this.getPointedNode() === null) {
      const organism = this.root.organismStore.getOrganisms()[0];
      const attr = this.root.attributeStore.getEditables(organism).next().value;
      const rootNode = this.root.attributeStore.getRootNode(attr);
      this.setPointedNode(this.nodeStore.getChild(rootNode, 0));
    } else {
      const attribute = this.root.attributeStore.getAttributeForNode(this.getPointedNode());
      const organism = this.root.attributeStore.getOrganismForAttribute(attribute);
      const attributes = this.root.attributeStore.getEditables(organism);
      const nextAttribute = wu.cycle(attributes).dropWhile(attr => attr !== attribute).drop(1).next().value;
      const node = this.nodeStore.getChild(this.root.attributeStore.getRootNode(nextAttribute), 0);
      this.setPointedNode(node);
    }
  }
}