import {SignalDispatcher} from "ste-signals";
import Functions from "@/code/Functions";

export default class WasmPen {
  private selectedNode = null;
  public onSelectedNodeChanged = new SignalDispatcher();

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
      return [{text: number, nodeMakerFunction: () => this.getModule().NumberNode.make(number)}];
    } else {
      return [];
    }
  }

  private static getOpNodeChoices(query) {
    const choices = [
      {text: 'Add', nodeMakerFunction: () => this.getModule().AddOpNode.make(this.makeZero(), this.makeZero())},
      {text: 'Sub', nodeMakerFunction: () => this.getModule().SubOpNode.make(this.makeZero(), this.makeZero())},
      {text: 'Mul', nodeMakerFunction: () => this.getModule().MulOpNode.make(this.makeZero(), this.makeZero())},
      {text: 'Div', nodeMakerFunction: () => this.getModule().DivOpNode.make(this.makeZero(), this.makeZero())},
      {text: 'Mod', nodeMakerFunction: () => this.getModule().ModOpNode.make(this.makeZero(), this.makeZero())},
    ];
    return choices.filter(choice => choice.text.toLowerCase().indexOf(query.toLowerCase()) >= 0);
  }

  private static getAttributeNodeChoices(selectedNode, query) {
    const organism = selectedNode.getOrganismRaw();
    const attributes = Functions.vectorToArray(organism.getAttributes());

    // We're returning a raw attribute pointer here.... could be messy

    return attributes.map(attribute => ({
      text: organism.getName() + "." + attribute.getName(),
      nodeMakerFunction: () => this.getModule().AttributeReferenceNode.make(attribute)
    })).filter(choice => choice.text.toLowerCase().indexOf(query.toLowerCase()) >= 0);
  }

  private static makeZero() {
    return this.getModule().NumberNode.make(0);
  }

  private static getModule() {
    return (<any>window).wasmModule;
  }
}