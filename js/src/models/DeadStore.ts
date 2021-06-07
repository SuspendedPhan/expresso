import Store from "@/models/Store";
import Functions from "@/code/Functions";

export default class DeadStore {
  public static fromLiveStore(liveStore: Store) {
    const deadStore = {
      projects: [] as any
    };
    for (const project of liveStore.getProjects()) {
      deadStore.projects.push(this.toDeadProject(project))
    }
    return deadStore;
  }

  public toLiveStore() {

  }

  private static toDeadProject(liveProject) {
    return {
      id: liveProject.getId(),
      rootOrganism: this.toDeadOrganism(liveProject.getRootOrganism())
    };
  }

  private static toLiveProject(deadProject) {

  }

  private static toDeadOrganism(liveOrganism) {
    return {
      id: liveOrganism.getId(),
      name: liveOrganism.getName(),
      attributes: Functions.vectorToArray(liveOrganism.getAttributes()).map(attribute => this.toDeadAttribute(attribute))
    }
  }

  private static toLiveOrganism(deadOrganism) {

  }

  private static toDeadAttribute(liveAttribute) {
    return {
      id: liveAttribute.getId(),
      name: liveAttribute.getName(),
      rootNode: this.toDeadNode(liveAttribute.getRootNode())
    }
  }

  private static toLiveAttribute(deadAttribute) {

  }

  private static toDeadNode(liveNode) {

  }

  private static toLiveNode(deadNode) {

  }
}