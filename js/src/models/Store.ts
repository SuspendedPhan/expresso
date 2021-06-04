export default class Store {
  private projects: any[] = [];

  constructor(private wasmModule) {}

  addProject() {
    const project = new this.wasmModule.Project();
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
}