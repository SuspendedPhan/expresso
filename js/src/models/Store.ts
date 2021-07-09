import DeadStore from "@/models/DeadStore";
import Functions from "@/code/Functions";

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
    } else if (node.constructor.name === 'NumberNode' || node.constructor.name === 'ParameterNode') {
      return [];
    } else {
      console.error('unexpected no children! ' + node.constructor.name);
      return [];
    }
  }

  public static isBinaryOpNode(parentRaw) {
    return parentRaw?.getA !== undefined;
  }
}