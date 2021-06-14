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

  public static toLiveStore(deadStore, emModule) {
    return {
      projects: deadStore.projects.map(deadProject => this.toLiveProject(deadProject, emModule))
    };
  }


  private static toDeadProject(liveProject) {
    return {
      id: liveProject.getId(),
      rootOrganism: this.toDeadOrganism(liveProject.getRootOrganism())
    };
  }

  private static toLiveProject(deadProject, emModule) {
    const liveProject = new emModule.Project();
    const liveRootOrganism = this.toLiveOrganism(deadProject.rootOrganism, emModule);
    liveProject.setRootOrganism(liveRootOrganism);
    return liveProject;
  }

  private static toDeadOrganism(liveOrganism) {
    return {
      id: liveOrganism.getId(),
      name: liveOrganism.getName(),
      attributes: Functions.vectorToArray(liveOrganism.getAttributes()).map(attribute => this.toDeadAttribute(attribute))
    }
  }

  private static toLiveOrganism(deadOrganism, emModule) {
    const liveOrganism = emModule.Organism.make(deadOrganism.name, deadOrganism.id);

  }


  private static toDeadAttribute(liveAttribute) {
    const answer = {
      id: liveAttribute.getId(),
      name: liveAttribute.getName(),
      type: liveAttribute.constructor.name,
    } as any;

    if (liveAttribute.getIsEditableAttribute()) {
      answer.rootNode = this.toDeadNode(liveAttribute.getRootNode());
    }

    return answer;
  }

  private static toLiveAttribute(deadAttribute) {

  }

  private static toDeadNode(liveNode) {
    const deadNode = {} as any;
    deadNode.id = liveNode.getId();
    deadNode.nodeType = liveNode.constructor.name;

    if (liveNode.constructor.name === 'NumberNode') {
      deadNode.value = liveNode.getValue();
    } else if (Store.isBinaryOpNode(liveNode)) {
      deadNode.a = liveNode.getA();
      deadNode.b = liveNode.getB();
    } else if (liveNode.constructor.name === 'AttributeReferenceNode') {
      deadNode.referenceAttributeId = liveNode.getReferenceRaw().getId();
    } else {
      console.error('toDeadNode: unknown node type');
    }
    return deadNode;
  }

  private static toLiveNode(deadNode) {

  }
}