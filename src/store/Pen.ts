import wu from "wu";
import { Root } from "./Root";
import Functions from "../code/Functions";
import Types from './Types';

interface NonePenPosition {
  positionType: "None";
}

interface NodePenPosition {
  positionType: "Node";
  referenceNodeId: string;
  relation: PenPositionRelation;
}

type PenPosition = NonePenPosition | NodePenPosition;

export enum PenPositionRelation {
  On = "On",
  After = "After",
  Before = "Before",
}

export default class Pen {
  penPosition = { positionType: "None" } as PenPosition;
  query = "";
  isQuerying = false;

  constructor(private root: Root) {}

  get nodeCollection() {
    return this.root.nodeStore;
  }

  // --- GETS ---

  getGhostEdits() {
    if (this.penPosition.positionType === "None") return wu([]);
    if (this.isQuerying === false) return wu([]);

    const answer = [] as any;
    const query = this.query;

    const requiredType = this.getPointedNode().datatype;

    // --- number ---

    const number = Number.parseFloat(this.query);
    if (!Number.isNaN(number)) {
      if (requiredType === Types.Number) {
        answer.push({
          text: number.toString(),
          addNodeFunction: () => this.nodeCollection.addNumber(number),
        });
      } else if (requiredType === Types.Vector) {
        answer.push({
          text: number.toString(),
          addNodeFunction: () => this.nodeCollection.addVector(number, 0),
        });
      } else {
        console.assert(false);
      }
      return wu(answer);
    }

    // --- attributes ---

    const pointedAttribute = this.root.attributeCollection.getAttributeForNode(
      this.getPointedNode()
    );
    const pointedOrganism = this.root.attributeCollection.getOrganismForAttribute(
      pointedAttribute
    );

    const ancestors = this.root.organismCollection.getAncestors(
      pointedOrganism
    );
    for (const organism of wu.chain([pointedOrganism], ancestors)) {
      const attributes = this.root.attributeCollection.getAttributesForOrganism(
        organism
      );
      for (const attribute of attributes) {
        const isSubsequence = Functions.isSubsequence(
          query.toLowerCase(),
          attribute.name.toLowerCase()
        );
        const ok =
          attribute !== pointedAttribute &&
          (query === "" || isSubsequence) &&
          attribute.datatype === requiredType;
        if (!ok) continue;

        const rootNode = this.root.attributeCollection.getRootNode(attribute);
        answer.push({
          text: `${organism.name}.${attribute.name}`,
          addNodeFunction: () => this.nodeCollection.addReference(rootNode),
        });
      }
    }

    // --- functions ---

    for (const metafun of this.root.metafunStore.getFuns()) {
      const isSubsequence = Functions.isSubsequence(
        query.toLowerCase(),
        metafun.name.toLowerCase()
      );
      const mustBeNumberType = metafun.inputTypesFromOutputType === undefined;
      const validOutputType = metafun.inputTypesFromOutputType?.(requiredType) !== undefined;
      const okNumberType = mustBeNumberType && requiredType === Types.Number;
      const ok = (query === "" || isSubsequence) && (okNumberType || validOutputType);
      if (!ok) continue;

      answer.push({
        text: metafun.name,
        addNodeFunction: () => this.nodeCollection.addFun(metafun, requiredType),
      });
    }

    return wu(answer);
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
    if (this.penPosition.positionType === "Node") {
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
      this.setQuery("");
    }
  }

  setPointedNode(node) {
    if (node === null) {
      this.penPosition = {
        positionType: "None",
      };
    } else {
      this.penPosition = {
        positionType: "Node",
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
  }

  commitGhostEdit(ghostEdit) {
    if (this.penPosition.positionType === "None") {
      console.error("None ghost edit");
    } else if (this.penPosition.positionType === "Node") {
      const node = ghostEdit.addNodeFunction();
      const referenceNode = this.nodeCollection.getFromId(
        this.penPosition.referenceNodeId
      );
      if (this.penPosition.relation === PenPositionRelation.On) {
        this.nodeCollection.replaceNode(referenceNode, node);
        this.setPointedNode(node);
        this.moveCursorRight();
        this.moveCursorRight();
      } else if (this.penPosition.relation === PenPositionRelation.Before) {
        this.nodeCollection.insertNodeAsParent(referenceNode, node);
        this.setPointedNode(node);
      } else {
        console.error("unexpected");
      }
    } else {
      console.error("unexpected");
    }
  }

  commitFirstGhostEdit() {
    this.commitGhostEdit(this.getGhostEdits().next().value);
  }

  moveCursorLeft() {
    if (this.penPosition.positionType === "None") return;

    if (this.penPosition.relation === PenPositionRelation.On) {
      this.penPosition.relation = PenPositionRelation.Before;
    } else if (this.penPosition.relation === PenPositionRelation.After) {
      this.penPosition.relation = PenPositionRelation.On;
    } else if (this.penPosition.relation === PenPositionRelation.Before) {
      const nodeStore = this.root.nodeStore;
      const traverse = Functions.traverseLeft(
        this.nodeCollection.getFromId(this.penPosition.referenceNodeId),
        (node) => this.nodeCollection.getParent(node, false),
        (node) => nodeStore.getChildren(node)
      );
      const node = traverse.next().value;
      if (node && !this.root.attributeCollection.isRootNode(node)) {
        this.penPosition = {
          positionType: "Node",
          referenceNodeId: node.id,
          relation: PenPositionRelation.On,
        };
      }
    }
  }

  moveCursorRight() {
    if (this.penPosition.positionType === "None") return;

    if (this.penPosition.relation === PenPositionRelation.Before) {
      this.penPosition.relation = PenPositionRelation.On;
    } else {
      const nodeStore = this.root.nodeStore;
      const traverse = Functions.traverseRight(
        this.getPointedNode(),
        (node) => this.nodeCollection.getParent(node, false),
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
      this.setPointedNode(this.nodeCollection.getChild(rootNode, 0));
    } else {
      const attribute = this.root.attributeStore.getAttributeForNode(
        this.getPointedNode()
      );
      const organism = this.root.attributeStore.getOrganismForAttribute(
        attribute
      );
      const attributes = Array.from(
        this.root.attributeStore.getEditables(organism)
      );
      attributes.reverse();
      const nextAttribute = wu
        .cycle(attributes)
        .dropWhile((attr) => attr !== attribute)
        .drop(1)
        .next().value;
      const node = this.nodeCollection.getChild(
        this.root.attributeStore.getRootNode(nextAttribute),
        0
      );
      this.setPointedNode(node);
    }
  }

  moveCursorDown() {
    if (this.getPointedNode() === null) {
      const organism = this.root.organismStore.getOrganisms()[0];
      const attr = this.root.attributeStore.getEditables(organism).next().value;
      const rootNode = this.root.attributeStore.getRootNode(attr);
      this.setPointedNode(this.nodeCollection.getChild(rootNode, 0));
    } else {
      const attribute = this.root.attributeStore.getAttributeForNode(
        this.getPointedNode()
      );
      const organism = this.root.attributeStore.getOrganismForAttribute(
        attribute
      );
      const attributes = this.root.attributeStore.getEditables(organism);
      const nextAttribute = wu
        .cycle(attributes)
        .dropWhile((attr) => attr !== attribute)
        .drop(1)
        .next().value;
      const node = this.nodeCollection.getChild(
        this.root.attributeStore.getRootNode(nextAttribute),
        0
      );
      this.setPointedNode(node);
    }
  }
}
