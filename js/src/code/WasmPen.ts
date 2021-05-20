import {SignalDispatcher} from "ste-signals";
import Functions from "@/code/Functions";

'ste-signals';

export default class WasmPen {
  selectedNode = null;
  onSelectedNodeChanged = new SignalDispatcher();

  getSelectedNode() {
    return this.selectedNode;
  }

  setSelectedNode(selectedNode) {
    this.selectedNode = selectedNode;
    this.onSelectedNodeChanged.dispatch();
  }

  static getNodeChoices(selectedNode, query) {
    let answer = [] as any;
    answer = answer.concat(this.getNumberNodeChoices(query));
    answer = answer.concat(this.getOpNodeChoices(query));
    answer = answer.concat(this.getAttributeNodeChoices(selectedNode, query));
    return answer;
  }

  private static getNumberNodeChoices(query) {
    const number = Number.parseFloat(query);
    if (!Number.isNaN(number)) {
      return [{text: number, nodeMakerFunction: () => window.wasmModule.NumberNode.make(number)}];
    } else {
      return [];
    }
  }

  private static getOpNodeChoices(query) {
    const choices = [
      {text: 'Add', nodeMakerFunction: () => window.wasmModule.AddOpNode.make(this.makeZero(), this.makeZero())},
      {text: 'Sub', nodeMakerFunction: () => window.wasmModule.SubOpNode.make(this.makeZero(), this.makeZero())},
      {text: 'Mul', nodeMakerFunction: () => window.wasmModule.MulOpNode.make(this.makeZero(), this.makeZero())},
      {text: 'Div', nodeMakerFunction: () => window.wasmModule.DivOpNode.make(this.makeZero(), this.makeZero())},
      {text: 'Mod', nodeMakerFunction: () => window.wasmModule.ModOpNode.make(this.makeZero(), this.makeZero())},
    ];
    return choices.filter(choice => choice.text.toLowerCase().indexOf(query.toLowerCase()) >= 0);
  }

  private static getAttributeNodeChoices(selectedNode, query) {
    const organism = selectedNode.getOrganismRaw();
    const attributes = Functions.vectorToArray(organism.getAttributes());

    // We're returning a raw attribute pointer here.... could be messy

    return attributes.map(attribute => ({
      text: organism.getName() + "." + attribute.getName(),
      nodeMakerFunction: () => window.wasmModule.AttributeReferenceNode.make(attribute)
    }));
  }

  private static makeZero() {
    return window.wasmModule.NumberNode.make(0);
  }
}