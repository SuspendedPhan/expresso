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
    return new Store(null, deadStore.projects.map(deadProject => this.toLiveProject(deadProject, emModule)));
  }


  private static toDeadProject(liveProject) {
    return {
      id: liveProject.getId(),
      rootOrganism: this.toDeadOrganism(liveProject.getRootOrganism())
    };
  }

  private static toLiveProject(deadProject, emModule) {
    const liveRootOrganism = this.toLiveOrganism(deadProject.rootOrganism, emModule);
    const liveAttributeById = new Map<string, any>();
    const deadAttributeById = new Map<string, any>();
    const liveAttributes: any = Array.from(this.getLiveAttributesDeep(liveRootOrganism));
    const deadAttributes: any = this.getDeadAttributesDeep(deadProject.rootOrganism);
    for (const liveAttribute of liveAttributes) {
      liveAttributeById.set(liveAttribute.getId(), liveAttribute);
    }
    for (const deadAttribute of deadAttributes) {
      deadAttributeById.set(deadAttribute.id, deadAttribute);
    }

    const liveEditableAttributes = liveAttributes.filter(attribute => attribute.constructor.name === 'EditableAttribute');
    for (const liveEditableAttribute of liveEditableAttributes) {
      const deadEditableAttribute = deadAttributeById.get(liveEditableAttribute.getId());
      const liveRootNode = this.toLiveNode(deadEditableAttribute.rootNode, emModule, liveAttributeById);
      liveEditableAttribute.setRootNode(liveRootNode);
    }
    return emModule.Project.makeUnique(liveRootOrganism);
  }

  private static toDeadOrganism(liveOrganism) {
    return {
      id: liveOrganism.getId(),
      name: liveOrganism.getName(),
      attributes: Functions.vectorToArray(liveOrganism.getAttributes()).map(attribute => this.toDeadAttribute(attribute)),
      suborganisms: Functions.vectorToArray(liveOrganism.getSuborganisms()).map(liveSuborganism => this.toDeadOrganism(liveSuborganism))
    }
  }

  private static toLiveOrganism(deadOrganism, emModule) {
    const liveOrganism = emModule.Organism.makeUnique(deadOrganism.name, deadOrganism.id);
    for (const deadAttribute of deadOrganism.attributes) {
      const liveAttribute = this.toLiveAttribute(deadAttribute, liveOrganism, emModule);
      liveOrganism.addAttribute(liveAttribute);
    }
    for (const deadSuborganism of deadOrganism.suborganisms) {
      liveOrganism.addSuborganism(this.toLiveOrganism(deadSuborganism, emModule));
    }
    return liveOrganism;
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

  private static toLiveAttribute(deadAttribute, liveOrganism, emModule) {
    if (deadAttribute.type == "EditableAttribute") {
      return emModule.EditableAttribute.makeUnique(deadAttribute.name, liveOrganism, deadAttribute.id);
    } else if (deadAttribute.type == "CloneNumberAttribute") {
      return emModule.CloneNumberAttribute.makeUnique(liveOrganism, deadAttribute.id);
    } else if (deadAttribute.type == "IntrinsicAttribute") {
      return emModule.IntrinsicAttribute.makeUnique(deadAttribute.name, liveOrganism, deadAttribute.id);
    }
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

  private static toLiveNode(deadNode, emModule, liveAttributeById) {
    if (deadNode.nodeType === 'AddOpNode') {
      return DeadStore.toLiveBinaryOpNode(deadNode, emModule.AddOpNode, emModule, liveAttributeById);
    } else if (deadNode.nodeType === 'SubOpNode') {
      return DeadStore.toLiveBinaryOpNode(deadNode, emModule.SubOpNode, emModule, liveAttributeById);
    } else if (deadNode.nodeType === 'MulOpNode') {
      return DeadStore.toLiveBinaryOpNode(deadNode, emModule.MulOpNode, emModule, liveAttributeById);
    } else if (deadNode.nodeType === 'DivOpNode') {
      return DeadStore.toLiveBinaryOpNode(deadNode, emModule.DivOpNode, emModule, liveAttributeById);
    } else if (deadNode.nodeType === 'ModOpNode') {
      return DeadStore.toLiveBinaryOpNode(deadNode, emModule.ModOpNode, emModule, liveAttributeById);
    } else if (deadNode.nodeType === 'NumberNode') {
      return emModule.NumberNode.makeUnique(deadNode.value, deadNode.id);
    } else if (deadNode.nodeType === 'AttributeReferenceNode') {
      // what to do here?
      return emModule.AttributeReferenceNode.makeUnique(liveAttributeById.get(deadNode.referenceAttributeId), deadNode.id);
    } else {
      console.error(deadNode.nodeType);
    }
  }

  private static toLiveBinaryOpNode(deadBinaryOpNode, BinaryOpNodeClass: any, emModule, liveAttributeById) {
    const liveA = this.toLiveNode(deadBinaryOpNode.a, emModule, liveAttributeById);
    const liveB = this.toLiveNode(deadBinaryOpNode.b, emModule, liveAttributeById);
    return BinaryOpNodeClass.makeUnique(liveA, liveB, deadBinaryOpNode.id);
  }

  private static * getLiveAttributesDeep(liveOrganism: any) {
    yield * Functions.vectorToIterable(liveOrganism.getAttributes());
    for (const suborganism of Functions.vectorToIterable(liveOrganism.getSuborganisms())) {
      yield * this.getLiveAttributesDeep(suborganism);
    }
  }

  private static * getDeadAttributesDeep(deadOrganism: any) {
    yield * deadOrganism.attributes;
    for (const deadSuborganism of deadOrganism.suborganisms) {
      yield * this.getDeadAttributesDeep(deadSuborganism);
    }
  }
}