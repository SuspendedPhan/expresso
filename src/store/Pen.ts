import wu from "wu";
import {Root} from "./Root";
import Functions from "../code/Functions";
import {EventEmitter} from "events";
import Types from "@/models/Types";
import Attribute from "@/models/Attribute";
import Metastruct from "@/models/Metastruct";

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

export interface Selection {
  attributeId: string;

  // Character index
  startIndex: number;

  // Character index
  endIndex: number;
}

interface AnnotatedText {
  char: string[1];
  node: any;
}

interface Bounds {
  startIndex: number;
  endIndex: number;
}

export default class Pen {
  penPosition = { positionType: "None" } as PenPosition;
  query = "";
  isQuerying = false;
  selection = null as Selection | null;
  events = new EventEmitter();

  constructor(private root: Root) {
    this.events.setMaxListeners(1000);
  }

  get nodeCollection() {
    return this.root.nodeStore;
  }

  // --- GETS ---

  getNodeChoices() {
    if (!this.isQuerying) return wu([]);

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
      } else if (requiredType instanceof Metastruct) {
        console.log('dunno what to do with structs');
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
      for (const attribute of attributes.filter(attribute => attribute !== pointedAttribute)) {
        const nodeChoices = this.getNodeChoicesForAttribute(query, organism, attribute, requiredType);
        for (const nodeChoice of nodeChoices) {
          answer.push(nodeChoice);
        }
      }
    }

    // --- functions ---

    for (const metafun of this.root.metafunStore.getFuns()) {
      const isSubsequence = Functions.isSubsequence(
        query.toLowerCase(),
        metafun.name.toLowerCase()
      );
      const inputTypesFromOutputType = (metafun as any)?.inputTypesFromOutputType;
      const mustBeNumberType = inputTypesFromOutputType === undefined;
      const validOutputType =
        inputTypesFromOutputType?.(requiredType) !== undefined;
      const okNumberType = mustBeNumberType && requiredType === Types.Number;
      const ok =
        (query === "" || isSubsequence) && (okNumberType || validOutputType);
      if (!ok) continue;

      answer.push({
        text: metafun.name,
        addNodeFunction: () =>
          this.nodeCollection.addFun(metafun, requiredType),
      });
    }

    return wu(answer);
  }

  private * getNodeChoicesForAttribute(query: string, organism, attribute: Attribute, requiredType) {
    const isSubsequence = Functions.isSubsequence(
        query.toLowerCase(),
        attribute.name.toLowerCase()
    );
    const ok =
        (query === "" || isSubsequence) &&
        attribute.datatype === requiredType;
    if (!ok) return;

    const rootNode = this.root.attributeCollection.getRootNode(attribute);
    yield {
      text: `${organism.name}.${attribute.name}`,
      addNodeFunction: () => this.nodeCollection.addReference(rootNode),
    };
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

  public getAnnotatedTextForAttribute(attribute: any) {
    const rootNode = this.root.attributeCollection.getRootNode(attribute);
    const node = this.root.nodeCollection.getChild(rootNode, 0);
    return this.getAnnotatedTextForNode(node);
  }

  getTextForAttribute(attribute: any) {
    return this.getAnnotatedTextForAttribute(attribute)
      .map((t) => t.char)
      .join("");
  }

  getSelection() {
    return this.selection;
  }

  private getAnnotatedTextForNode(astNode) {
    const root = this.root;
    if (astNode.metaname === "Number") {
      return this.textToAnnotatedText(astNode.value.toString(), astNode);
    } else if (astNode.metaname === "Vector") {
      console.assert(
        root.nodeCollection.getChildren(astNode).toArray().length == 2,
        "Attribute.vue vector"
      );
      const xNode = root.nodeCollection.getChild(astNode, 0);
      const yNode = root.nodeCollection.getChild(astNode, 1);
      let answer = [] as any;
      answer.push({ char: "<", node: astNode });
      answer = answer.concat(this.getAnnotatedTextForNode(xNode));
      answer.push({ char: ",", node: null });
      answer = answer.concat(this.getAnnotatedTextForNode(yNode));
      answer.push({ char: ">", node: null });
      return answer;
    } else if (astNode.metaname === "Reference") {
      return this.textToAnnotatedText(
        this.referenceToString(astNode, root),
        astNode
      );
    } else if (astNode.metaname === "Function") {
      const funName = this.funToString(astNode, root);
      const children = Array.from(root.nodeCollection.getChildren(astNode));
      let answer = [] as any;
      answer = answer.concat(this.textToAnnotatedText(funName, astNode));
      answer.push({ char: "(", node: null });
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (i !== 0) {
          answer.push({ char: ",", node: null });
        }
        answer = answer.concat(this.getAnnotatedTextForNode(child));
      }
      answer.push({ char: ")", node: null });
      return answer;
    } else if (astNode.metaname === "Variable") {
      console.error("Attribute.vue not expecting Variable");
    } else {
      console.error("Attribute.vue Unknown metaname");
    }
  }

  public setPointedNode(node) {
    const attribute = this.root.attributeCollection.getAttributeForNode(node);
    const annotatedText = this.getAnnotatedTextForAttribute(attribute);
    this.selection = this.makeSelectionForNode(
      node,
      annotatedText,
      attribute!.id
    );
  }

  public getPointedNode() {
    const selection = this.getSelection();
    if (selection === null) return null;

    const attribute = this.root.attributeCollection.getAttributeFromId(
      selection.attributeId
    );
    const annotatedText = this.getAnnotatedTextForAttribute(attribute);
    return annotatedText[selection.startIndex].node;
  }

  private referenceToString(referenceNode, root) {
    const targetNode = root.nodeStore.getTargetNodeForReference(referenceNode);
    return root.attributeStore.getAttributeForNode(targetNode).name;
  }

  private funToString(funNode, root) {
    const metafun = root.metafunStore.getFromName(funNode.metafunName);
    return metafun.name;
  }

  private textToAnnotatedText(text, astNode) {
    return text.split("").map((t) => ({
      char: t,
      node: astNode,
    }));
  }

  private getCharBoundsForNode(astNode, annotatedText) {
    let startIndex = null as null | number;
    for (let i = 0; i < annotatedText.length; i++) {
      if (annotatedText[i].node === astNode) {
        startIndex = i;
        break;
      }
    }

    let endIndex = null as null | number;
    for (let i = annotatedText.length; i > 0; i--) {
      if (annotatedText[i - 1].node === astNode) {
        endIndex = i;
        break;
      }
    }
    console.assert(startIndex !== null);
    console.assert(endIndex !== null);
    return { startIndex, endIndex } as Bounds;
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

  setSelection(selection: Selection | null) {
    this.selection = this.calcSelection(selection, this.selection);
  }

  private calcSelection(
    selection: Selection | null,
    prevSelection: Selection | null
  ): Selection | null {
    if (selection === null) return null;

    const attribute = this.root.attributeCollection.getAttributeFromId(
      selection.attributeId
    );
    const annotatedText = this.getAnnotatedTextForAttribute(attribute);
    console.assert(selection.startIndex >= 0);
    console.assert(selection.endIndex <= annotatedText.length);

    if (
      this.didPassOverSingleCharNode(prevSelection, selection, annotatedText)
    ) {
      let node;
      if (this.didGoLeft(prevSelection, selection)) {
        node = annotatedText[selection.startIndex].node;
        node =
          node ?? this.getNodeToLeftOfChar(selection.startIndex, annotatedText);
      } else {
        node = this.getNodeToLeftOfChar(selection.startIndex, annotatedText);
      }
      return this.makeSelectionForNode(
        node,
        annotatedText,
        selection.attributeId
      );
    } else {
      const node = annotatedText[selection.startIndex]?.node ?? null;
      if (node === null) {
        if (this.didGoLeft(prevSelection, selection)) {
          const leftNode = this.getNodeToLeftOfChar(
            selection.startIndex,
            annotatedText
          );
          return this.makeSelectionForNode(
            leftNode,
            annotatedText,
            selection.attributeId
          );
        } else {
          // Either right or new selection
          const rightNode = this.getNodeToRightOfChar(
            selection.startIndex,
            annotatedText
          );
          if (rightNode === null) {
            const leftNode = this.getNodeToLeftOfChar(
              selection.startIndex,
              annotatedText
            );
            return this.makeSelectionForNode(
              leftNode,
              annotatedText,
              selection.attributeId
            );
          } else {
            return this.makeFrontSelectionForNode(
              rightNode,
              annotatedText,
              selection.attributeId
            );
          }
        }
      } else {
        if (this.isIndexInsideNode(selection.startIndex, node, annotatedText)) {
          return this.makeSelectionForNode(
            node,
            annotatedText,
            selection.attributeId
          );
        } else {
          return this.makeFrontSelectionForNode(
            node,
            annotatedText,
            selection.attributeId
          );
        }
      }
    }
  }

  private didPassOverSingleCharNode(
    prevSelection: Selection | null,
    selection: Selection,
    annotatedText: AnnotatedText[]
  ) {
    if (prevSelection === null) return false;
    if (prevSelection.attributeId !== selection.attributeId) return false;

    const frontIndex = Math.min(selection.startIndex, prevSelection.startIndex);
    const backIndex = Math.max(selection.startIndex, prevSelection.startIndex);
    const node = annotatedText[frontIndex].node;
    if (node === null) return false;

    const prevSingleChar = prevSelection.startIndex === prevSelection.endIndex;
    const currentSingleChar = selection.startIndex === selection.endIndex;

    const charBoundsForNode = this.getCharBoundsForNode(node, annotatedText);
    const oneCharApart =
      charBoundsForNode.endIndex - charBoundsForNode.startIndex === 1;
    const skippedOverNode =
      frontIndex === charBoundsForNode.startIndex &&
      backIndex === charBoundsForNode.endIndex;

    return (
      prevSingleChar && currentSingleChar && oneCharApart && skippedOverNode
    );
  }

  private isIndexInsideNode(charIndex, node, annotatedText) {
    const charBoundsForNode = this.getCharBoundsForNode(node, annotatedText);
    return (
      charIndex > charBoundsForNode.startIndex &&
      charIndex < charBoundsForNode.endIndex
    );
  }

  private didGoLeft(prevSelection, selection) {
    if (prevSelection === null) return false;
    if (prevSelection.attributeId !== selection.attributeId) return false;
    if (selection.startIndex < prevSelection.startIndex) return true;
    if (selection.startIndex > prevSelection.startIndex) return false;
    if (selection.endIndex < prevSelection.endIndex) return true;
    return false;
  }

  private getNodeToLeftOfChar(index, annotatedText: AnnotatedText[]) {
    let node = null;
    for (let i = index - 1; i >= 0; i--) {
      node = annotatedText[i].node;
      if (node !== null) {
        break;
      }
    }
    return node;
  }

  private getNodeToRightOfChar(index, annotatedText: AnnotatedText[]) {
    let node = null;
    for (let i = index; i < annotatedText.length; i++) {
      node = annotatedText[i].node;
      if (node !== null) {
        break;
      }
    }
    return node;
  }

  private makeSelectionForNode(node, annotatedText, attributeId) {
    return { ...this.getCharBoundsForNode(node, annotatedText), attributeId };
  }

  private makeFrontSelectionForNode(node, annotatedText, attributeId) {
    const charBoundsForNode = this.getCharBoundsForNode(node, annotatedText);
    return {
      startIndex: charBoundsForNode.startIndex,
      endIndex: charBoundsForNode.startIndex,
      attributeId,
    };
  }

  setQuery(query) {
    this.query = query;
  }

  commitNodeChoice(nodeChoice) {
    const node = nodeChoice.addNodeFunction();
    const referenceNode = this.getPointedNode();

    if (this.isCursorInserting()) {
      this.nodeCollection.insertNodeAsParent(referenceNode, node);
    } else {
      this.nodeCollection.replaceNode(referenceNode, node);
    }

    const attribute = this.root.attributeCollection.getAttributeFromId(
      this.getSelection()!.attributeId
    );
    const annotatedText = this.getAnnotatedTextForAttribute(attribute);
    this.selection = this.makeSelectionForNode(
      node,
      annotatedText,
      attribute!.id
    );
    this.moveCursorRight();
    this.moveCursorRight();

    this.events.emit("afterPenCommit");
  }

  private moveCursorRight() {
    const selection = this.selection as Selection;
    const annotatedText = this.getAnnotatedTextForAttribute(
      this.getSelectedAttribute()
    );
    const index = Math.min(selection.endIndex, annotatedText.length);
    this.setSelection({
      ...selection,
      startIndex: index,
      endIndex: index,
    });
  }

  tryPromoteSelectionToRoot() {
    console.assert(!this.getIsQuerying());
    const node = this.getPointedNode();
    console.assert(node != null);

    const attribute = this.getSelectedAttribute();
    const rootNode = this.root.attributeCollection.getRootNode(attribute);
    if (node.datatype === rootNode.datatype) {
      this.nodeCollection.reparent({
        child: node,
        newParent: rootNode,
        childIndex: 0,
      });
      const annotatedText = this.getAnnotatedTextForAttribute(attribute);
      this.selection = this.makeSelectionForNode(
        node,
        annotatedText,
        attribute!.id
      );
      this.events.emit("afterPenCommit");
    }
  }

  public isCursorInserting(): boolean {
    const selection = this.getSelection() as Selection;
    console.assert(selection !== null);
    const isZeroLengthSelection = selection.startIndex === selection.endIndex;
    return isZeroLengthSelection;
  }

  public getSelectedAttribute() {
    console.assert(this.getSelection() !== null);
    return this.root.attributeCollection.getAttributeFromId(
      this.getSelection()!.attributeId
    );
  }

  commitFirstNodeChoice() {
    this.commitNodeChoice(this.getNodeChoices().next().value);
  }
}
