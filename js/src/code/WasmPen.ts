import {SignalDispatcher} from "ste-signals"; 'ste-signals';

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
    return [
      {text: 'Ten', nodeMakerFunction: () => window.wasmModule.NumberNode.make(10) }
    ]
  }
}