import DeadStore from "@/models/DeadStore";
import Functions from "@/code/Functions";

export enum SiblingRotationDirection {
  Left,
  Right
}

export default class Store {
  constructor(private wasmModule, private projects: any[] = []) {}

  addProject() {
    const organism = this.wasmModule.Project.makeRootOrganism();
    const project = this.wasmModule.Project.makeUnique(organism);
    this.projects.push(project);
    return project;
  }

  removeProject(project) {
    this.projects = this.projects.filter(t => t !== project);
    project.delete();
  }

  getProjects() {
    return this.projects;
  }

  save() {
    const jsonDeadStore = JSON.stringify(DeadStore.fromLiveStore(this));
    window.localStorage.setItem("emcc-evolved", jsonDeadStore);
  }

  static makeDefault(emModule: any) {
    const store = new Store(emModule);
    store.addProject();
    return store;
  }

  static loadOrMake(emModule: any): Store {
    const jsonDeadStore = window.localStorage.getItem("emcc-evolved");
    if (jsonDeadStore === null) {
      return Store.makeDefault(emModule);
    }
    const deadStore = JSON.parse(jsonDeadStore);
    return DeadStore.toLiveStore(deadStore, emModule);
  }

  public static getChildren(node) {
    if (this.isBinaryOpNode(node)) {
      const a = node.getA();
      const b = node.getB();
      return [a, b];
    } else if (node.constructor.name === 'FunctionCallNode') {
      const parameters = Functions.vectorToIterable(node.getFunction().getParameters());
      const argumentByParameterMap = node.getArgumentByParameterMap();
      const argumentRootNodes: any = [];
      for (const parameter of parameters) {
        const argumentRootNode = argumentByParameterMap.get(parameter);
        argumentRootNodes.push(argumentRootNode);
      }
      return argumentRootNodes;
    } else if (node.constructor.name === 'NumberNode' || node.constructor.name === 'ParameterNode' || node.constructor.name === 'AttributeReferenceNode') {
      return [];
    } else {
      console.error('unexpected no children! ' + node.constructor.name);
      return [];
    }
  }

  public static isBinaryOpNode(parentRaw) {
    return parentRaw?.getA !== undefined;
  }

  public static getSibling(parentNode: any, node, rotationDirection: SiblingRotationDirection) {
    if (this.isBinaryOpNode(parentNode)) {
      return this.getOtherBinaryOpSibling(parentNode, node);
    } else if (parentNode.constructor.name === 'FunctionCallNode') {
      const argumentByParameterMap = parentNode.getArgumentByParameterMap();
      const parameterCount = argumentByParameterMap.size();
      const parameters = argumentByParameterMap.keys();
      for (let i = 0; i < parameterCount; i++) {
        const parameter = parameters.get(i);
        const argument = argumentByParameterMap.get(parameter);
        if (argument.getId() == node.getId()) {
          const index = (() => {
            if (rotationDirection == SiblingRotationDirection.Left) {
              return (i - 1 + parameterCount) % parameterCount;
            } else if (rotationDirection == SiblingRotationDirection.Right) {
              return (i + 1) % parameterCount;
            } else {
              console.error('SiblingRotationDirection')
            }
          })();
          return argumentByParameterMap.get(parameters.get(index));
        }
      }
      console.error('getSibling nothing')
    } else {
      console.error('store getsibling');
    }
  }

  private static getOtherBinaryOpSibling(binaryOpParent, node) {
    const rawA = binaryOpParent.getA();
    const rawB = binaryOpParent.getB();
    if (node.getId() === rawA.getId()) {
      return rawB;
    } else {
      return rawA;
    }
  }
}