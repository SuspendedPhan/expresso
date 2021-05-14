import wu from "wu";
import { Root } from "./Root";
import Functions from "../code/Functions";
import { EventEmitter } from "events";
import Type, { Primitive } from "@/models/Type";
import Attribute from "@/models/Attribute";
import Metastruct from "@/models/Metastruct";
import Node from "@/models/Node";

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
  Before = "Before"
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
      if (
        requiredType === Primitive.Number ||
        requiredType === Primitive.Undetermined
      ) {
        answer.push({
          text: number.toString(),
          addNodeFunction: () => this.nodeCollection.addNumber(number)
        });
      } else if (requiredType instanceof Metastruct) {
        console.log("dunno what to do with structs");
      } else {
        console.assert(false, requiredType);
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
      for (const attribute of attributes.filter(
        attribute => attribute !== pointedAttribute
      )) {
        const nodeChoices = this.getNodeChoicesForAttribute(
          query,
          organism,
          attribute,
          requiredType
        );
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
      const inputTypesFromOutputType = (metafun as any)
        ?.inputTypesFromOutputType;
      const mustBeNumberType = inputTypesFromOutputType === undefined;
      const validOutputType =
        inputTypesFromOutputType?.(requiredType) !== undefined;
      const okNumberType =
        mustBeNumberType && requiredType === Primitive.Number;
      const isUndetermined = requiredType === Primitive.Undetermined;
      const ok =
        (query === "" || isSubsequence) &&
        (okNumberType || validOutputType || isUndetermined);
      if (!ok) continue;

      let outputType = requiredType;
      if (outputType === Primitive.Undetermined) {
        if (mustBeNumberType) {
          outputType = Primitive.Number;
        } else if ("defaultOutputType" in metafun) {
          outputType = metafun.defaultOutputType;
        } else {
          console.assert(false, metafun);
        }
      }
      answer.push({
        text: metafun.name,
        addNodeFunction: () => this.nodeCollection.addFun(metafun, outputType)
      });
    }

    return wu(answer);
  }

  private *getNodeChoicesForAttribute(
    query: string,
    organism,
    attribute: Attribute,
    requiredType
  ) {
    const isSubsequence = Functions.isSubsequence(
      query.toLowerCase(),
      attribute.name.toLowerCase()
    );

    if (attribute.datatype instanceof Metastruct) {
      for (let i = 0; i < attribute.datatype.members.length; i++) {
        const member = attribute.datatype.members[i];
        console.assert(member.type === Primitive.Number, member);

        const path = `${organism.name}.${attribute.name}.${member.name}`;
        const isSubsequence = Functions.isSubsequence(
          query.toLowerCase(),
          path.toLowerCase()
        );
        const ok =
          (query === "" || isSubsequence) && member.type === requiredType;
        if (ok) {
          yield {
            text: path,
            addNodeFunction: () => this.nodeCollection.addStructMemberReference(attribute.getRootNode(), i)
          };
        }
      }
    }

    const ok =
      (query === "" || isSubsequence) &&
      (attribute.datatype === requiredType ||
        requiredType === Primitive.Undetermined) &&
      attribute.datatype !== Primitive.Undetermined;
    if (!ok) return;

    const rootNode = this.root.attributeCollection.getRootNode(attribute);
    yield {
      text: `${organism.name}.${attribute.name}`,
      addNodeFunction: () => this.nodeCollection.addReference(rootNode)
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
      .map(t => t.char)
      .join("");
  }

  getSelection() {
    return this.selection;
  }

  private getAnnotatedTextForNode(astNode) {
    const root = this.root;
    if (astNode.metaname === "Number") {
      return this.textToAnnotatedText(astNode.value.toString(), astNode);
    } else if (
      astNode.metaname === "Struct" &&
      astNode.datatype.id === Metastruct.builtinMetastructs.Vector.id
    ) {
      console.assert(
        root.nodeCollection.getChildren(astNode).toArray().length == 2,
        "Attribute.vue vector"
      );
      console.assert(astNode);
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
        Pen.referenceToString(astNode, root),
        astNode
      );
    } else if (astNode.metaname === "Function") {
      const funName = Pen.funToString(astNode, root);
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
    } else if (astNode.metaname === "Void") {
      return this.textToAnnotatedText("None", astNode);
    } else if(astNode.metaname==="StructMemberReference"){
      return this.textToAnnotatedText(Pen.structMemberReferenceToString(astNode), astNode);
    } else {
      console.error("Attribute.vue Unknown metaname");
    }
  }

  public setPointedNode(node) {
    const attribute = this.root.attributeCollection.getAttributeForNode(node);
    const annotatedText = this.getAnnotatedTextForAttribute(attribute);
    this.selection = Pen.makeSelectionForNode(
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

  private static referenceToString(referenceNode, root) {
    const targetNode = root.nodeStore.getTargetNodeForReference(referenceNode);
    return root.attributeStore.getAttributeForNode(targetNode).name;
  }

  private static structMemberReferenceToString(node) {
    const targetNode = Node.getFromId(node.targetVariableNodeId);
    const memberName = targetNode.datatype.members[node.memberIndex].name;
    const attributeName = Attribute.getAttributeForNode(targetNode).name;
    return`${attributeName}.${memberName}`;
  }

  private static funToString(funNode, root) {
    const metafun = root.metafunStore.getFromName(funNode.metafunName);
    return metafun.name;
  }

  private textToAnnotatedText(text, astNode) {
    return text.split("").map(t => ({
      char: t,
      node: astNode
    }));
  }

  private static getCharBoundsForNode(astNode, annotatedText) {
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
      Pen.didPassOverSingleCharNode(prevSelection, selection, annotatedText)
    ) {
      let node;
      if (Pen.didGoLeft(prevSelection, selection)) {
        node = annotatedText[selection.startIndex].node;
        node =
          node ?? Pen.getNodeToLeftOfChar(selection.startIndex, annotatedText);
      } else {
        node = Pen.getNodeToLeftOfChar(selection.startIndex, annotatedText);
      }
      return Pen.makeSelectionForNode(
        node,
        annotatedText,
        selection.attributeId
      );
    } else {
      const node = annotatedText[selection.startIndex]?.node ?? null;
      if (node === null) {
        if (Pen.didGoLeft(prevSelection, selection)) {
          const leftNode = Pen.getNodeToLeftOfChar(
            selection.startIndex,
            annotatedText
          );
          return Pen.makeSelectionForNode(
            leftNode,
            annotatedText,
            selection.attributeId
          );
        } else {
          // Either right or new selection
          const rightNode = Pen.getNodeToRightOfChar(
            selection.startIndex,
            annotatedText
          );
          if (rightNode === null) {
            const leftNode = Pen.getNodeToLeftOfChar(
              selection.startIndex,
              annotatedText
            );
            return Pen.makeSelectionForNode(
              leftNode,
              annotatedText,
              selection.attributeId
            );
          } else {
            return Pen.makeFrontSelectionForNode(
              rightNode,
              annotatedText,
              selection.attributeId
            );
          }
        }
      } else {
        if (Pen.isIndexInsideNode(selection.startIndex, node, annotatedText)) {
          return Pen.makeSelectionForNode(
            node,
            annotatedText,
            selection.attributeId
          );
        } else {
          return Pen.makeFrontSelectionForNode(
            node,
            annotatedText,
            selection.attributeId
          );
        }
      }
    }
  }

  private static didPassOverSingleCharNode(
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

    const charBoundsForNode = Pen.getCharBoundsForNode(node, annotatedText);
    const oneCharApart =
      charBoundsForNode.endIndex - charBoundsForNode.startIndex === 1;
    const skippedOverNode =
      frontIndex === charBoundsForNode.startIndex &&
      backIndex === charBoundsForNode.endIndex;

    return (
      prevSingleChar && currentSingleChar && oneCharApart && skippedOverNode
    );
  }

  private static isIndexInsideNode(charIndex, node, annotatedText) {
    const charBoundsForNode = Pen.getCharBoundsForNode(node, annotatedText);
    return (
      charIndex > charBoundsForNode.startIndex &&
      charIndex < charBoundsForNode.endIndex
    );
  }

  private static didGoLeft(prevSelection, selection) {
    if (prevSelection === null) return false;
    if (prevSelection.attributeId !== selection.attributeId) return false;
    if (selection.startIndex < prevSelection.startIndex) return true;
    if (selection.startIndex > prevSelection.startIndex) return false;
    if (selection.endIndex < prevSelection.endIndex) return true;
    return false;
  }

  private static getNodeToLeftOfChar(index, annotatedText: AnnotatedText[]) {
    let node = null;
    for (let i = index - 1; i >= 0; i--) {
      node = annotatedText[i].node;
      if (node !== null) {
        break;
      }
    }
    return node;
  }

  private static getNodeToRightOfChar(index, annotatedText: AnnotatedText[]) {
    let node = null;
    for (let i = index; i < annotatedText.length; i++) {
      node = annotatedText[i].node;
      if (node !== null) {
        break;
      }
    }
    return node;
  }

  private static makeSelectionForNode(node, annotatedText, attributeId) {
    return { ...Pen.getCharBoundsForNode(node, annotatedText), attributeId };
  }

  private static makeFrontSelectionForNode(node, annotatedText, attributeId) {
    const charBoundsForNode = Pen.getCharBoundsForNode(node, annotatedText);
    return {
      startIndex: charBoundsForNode.startIndex,
      endIndex: charBoundsForNode.startIndex,
      attributeId
    };
  }

  setQuery(query) {
    this.query = query;
  }

  commitNodeChoice(nodeChoice) {
    const node = nodeChoice.addNodeFunction();
    const referenceNode = this.getPointedNode();
    const attribute = this.root.attributeCollection.getAttributeFromId(
      this.getSelection()!.attributeId
    ) as Attribute;

    const isUndeterminedAttribute = attribute.datatype === Primitive.Undetermined;
    if (isUndeterminedAttribute) {
      console.assert(Node.getChild(attribute.getRootNode(),0).id === referenceNode.id);
      console.assert(referenceNode.datatype === Primitive.Undetermined, referenceNode);
    }

    if (this.isCursorInserting() && !isUndeterminedAttribute) {
      this.nodeCollection.insertNodeAsParent(referenceNode, node);
    } else {
      this.nodeCollection.replaceNode(referenceNode, node);
    }

    if (isUndeterminedAttribute) {
      attribute.datatype = node.datatype;
      attribute.getRootNode().datatype = node.datatype;
    }

    const annotatedText = this.getAnnotatedTextForAttribute(attribute);
    this.selection = Pen.makeSelectionForNode(
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
      endIndex: index
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
        childIndex: 0
      });
      const annotatedText = this.getAnnotatedTextForAttribute(attribute);
      this.selection = Pen.makeSelectionForNode(
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
