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
    const organism = selectedNode.getOrganism();
    const fun = selectedNode.getFunction();
    if (organism !== null) {
      return this.getNodeChoicesForAttributeNode(query, organism);
    } else if (fun !== null) {
      return this.getNodeChoicesForFunctionNode(query, fun);
    } else {
      console.error('dont know where this node belongs');
    }
  }

  private static getNodeChoicesForAttributeNode(query, parentOrganism) {
    let answer = [] as any;
    answer = answer.concat(this.getNumberNodeChoices(query));
    answer = answer.concat(this.getOpNodeChoices(query));
    answer = answer.concat(this.getAttributeNodeChoices(query, parentOrganism));
    answer = answer.concat(this.getFunctionCallNodeChoices(query, parentOrganism.getProject()));
    answer = answer.concat(this.getPrimitiveFunctionCallNodeChoices(query));
    return answer;
  }

  private static getNodeChoicesForFunctionNode(query, parentFun) {
    let answer = [] as any;
    answer = answer.concat(this.getNumberNodeChoices(query));
    answer = answer.concat(this.getOpNodeChoices(query));
    answer = answer.concat(this.getParameterNodeChoices(query, parentFun));
    answer = answer.concat(this.getPrimitiveFunctionCallNodeChoices(query));
    return answer;
  }

  private static getNumberNodeChoices(query) {
    const number = Number.parseFloat(query);
    if (!Number.isNaN(number)) {
      return [{text: number, nodeMakerFunction: () => this.getModule().NumberNode.makeUnique(number)}];
    } else {
      return [];
    }
  }

  private static getOpNodeChoices(query) {
    const choices = [
      {text: 'Add', nodeMakerFunction: () => this.getModule().AddOpNode.makeUnique(this.makeZero(), this.makeZero())},
      {text: 'Sub', nodeMakerFunction: () => this.getModule().SubOpNode.makeUnique(this.makeZero(), this.makeZero())},
      {text: 'Mul', nodeMakerFunction: () => this.getModule().MulOpNode.makeUnique(this.makeZero(), this.makeZero())},
      {text: 'Div', nodeMakerFunction: () => this.getModule().DivOpNode.makeUnique(this.makeZero(), this.makeZero())},
      {text: 'Mod', nodeMakerFunction: () => this.getModule().ModOpNode.makeUnique(this.makeZero(), this.makeZero())},
    ];
    return choices.filter(choice => choice.text.toLowerCase().indexOf(query.toLowerCase()) >= 0);
  }

  private static getAttributeNodeChoices(query, parentOrganism) {
    const attributes = Functions.vectorToArray(parentOrganism.getAttributes());
    return attributes.map(attribute => ({
      text: parentOrganism.getName() + "." + attribute.getName(),
      nodeMakerFunction: () => this.getModule().AttributeReferenceNode.makeUnique(attribute)
    })).filter(choice => choice.text.toLowerCase().indexOf(query.toLowerCase()) >= 0);
  }

  private static getParameterNodeChoices(query, parentFun) {
    const choices = Functions.vectorToArray(parentFun.getParameters()).map(parameter => ({
      text: parameter.getName(),
      nodeMakerFunction: () => this.getModule().ParameterNode.makeUnique(parameter)
    }));
    return choices.filter(choice => choice.text.toLowerCase().indexOf(query.toLowerCase()) >= 0);
  }

  private static getFunctionCallNodeChoices(query, project) {
    const choices = Functions.vectorToArray(project.getFunctions()).map(fun => ({
      text: fun.getName(),
      nodeMakerFunction: () => {
        const funCallNode = this.getModule().FunctionCallNode.makeUnique(fun);
        for (const parameter of Functions.vectorToIterable(fun.getParameters())) {
          funCallNode.getArgumentCollection().setArgument(parameter, this.makeZero());
        }
        return funCallNode;
      }
    }));
    return choices.filter(choice => choice.text.toLowerCase().indexOf(query.toLowerCase()) >= 0);
  }

  private static getPrimitiveFunctionCallNodeChoices(query) {
    const primitiveFunctions = Functions.vectorToArray(this.getModule().PrimitiveFunctionCollection.getInstance().getFunctions());
    const choices = primitiveFunctions.map(fun => ({
      text: fun.getName(),
      nodeMakerFunction: () => {
        const funCallNode = this.getModule().PrimitiveFunctionCallNode.makeUnique(fun);
        for (const parameter of Functions.vectorToIterable(fun.getParameters())) {
          funCallNode.getArgumentCollection().setArgument(parameter, this.makeZero());
        }
        return funCallNode;
      }
    }));
    return choices.filter(choice => choice.text.toLowerCase().indexOf(query.toLowerCase()) >= 0);
  }

  private static makeZero() {
    return this.getModule().NumberNode.makeUnique(0);
  }

  private static getModule() {
    return (<any>window).wasmModule;
  }
}