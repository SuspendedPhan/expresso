import DeadStore from "@/models/DeadStore";

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

  static loadOrMake(emModule: any): Store {
    const jsonDeadStore = window.localStorage.getItem("emcc-evolved");
    if (jsonDeadStore === null) {
      const store = new Store(emModule);
      store.addProject();
      return store;
    }
    const deadStore = JSON.parse(jsonDeadStore);
    return DeadStore.toLiveStore(deadStore, emModule);
  }

  public static getChildren(node) {
    if (this.isBinaryOpNode(node)) {
      const a = node.getA();
      const b = node.getB();
      return [a, b];
    } else {
      return [];
    }
  }

  public static isBinaryOpNode(parentRaw) {
    return parentRaw?.getA !== undefined;
  }
}