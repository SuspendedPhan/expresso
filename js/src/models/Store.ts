export default class Store {
  private projects: any[] = [];

  constructor(private wasmModule) {}

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

  }

  load() {

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