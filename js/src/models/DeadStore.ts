import Store from "@/models/Store";
import Functions from "@/code/Functions";
import {elementAt} from "rxjs/operators";

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
    const deadFunctions = Functions.vectorToArray(liveProject.getFunctions()).map(liveFunction => this.toDeadFunction(liveFunction));
    return {
      id: liveProject.getId(),
      rootOrganism: this.toDeadOrganism(liveProject.getRootOrganism()),
      functions: deadFunctions
    };
  }

  private static toLiveProject(deadProject, emModule) {
    const liveRootOrganism = this.toLiveOrganism(deadProject.rootOrganism, emModule);

    // root organism NEEDS to have its dead attributes revived before adding it to the project because of Project::addRootAttributes
    const liveProject = emModule.Project.makeUnique(liveRootOrganism);

    const liveFunctionById = new Map();
    const deadFunctionById = new Map();
    const liveParameterById = new Map();
    for (const deadFunction of deadProject.functions) {
      const liveFunction = this.toLiveFunction(deadFunction, emModule);
      liveProject.addFunction(liveFunction);
      liveFunctionById.set(deadFunction.id, liveFunction);
      deadFunctionById.set(deadFunction.id, deadFunction);
      for (const liveParameter of Functions.vectorToIterable(liveFunction.getParameters())) {
        liveParameterById.set(liveParameter.getId(), liveParameter);
      }
    }

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

    for (const [functionId, liveFunction] of liveFunctionById.entries()) {
      const deadFunction = deadFunctionById.get(functionId);
      const liveRootNode = this.toLiveNode(deadFunction.rootNode, emModule, liveAttributeById, liveFunctionById, liveParameterById);
      liveFunction.setRootNode(liveRootNode);
    }

    const liveEditableAttributes = liveAttributes.filter(attribute => attribute.constructor.name === 'EditableAttribute');
    for (const liveEditableAttribute of liveEditableAttributes) {
      const deadEditableAttribute = deadAttributeById.get(liveEditableAttribute.getId());
      const liveRootNode = this.toLiveNode(deadEditableAttribute.rootNode, emModule, liveAttributeById, liveFunctionById, liveParameterById);
      liveEditableAttribute.setRootNode(liveRootNode);
    }
    return liveProject;
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
      deadNode.a = this.toDeadNode(liveNode.getA());
      deadNode.b = this.toDeadNode(liveNode.getB());
    } else if (liveNode.constructor.name === 'AttributeReferenceNode') {
      deadNode.referenceAttributeId = liveNode.getReferenceRaw().getId();
    } else if (liveNode.constructor.name === 'FunctionCallNode') {
      const deadArgumentByParameterId = {};
      for (const parameter of Functions.vectorToIterable(liveNode.getCalledFunction().getParameters())) {
        const argument = liveNode.getArgumentCollection().getArgument(parameter);
        deadArgumentByParameterId[parameter.getId()] = this.toDeadNode(argument);
      }
      deadNode.functionId = liveNode.getCalledFunction().getId();
      deadNode.argumentByParameterId = deadArgumentByParameterId;
    } else if (liveNode.constructor.name === 'ParameterNode') {
      deadNode.parameterId = liveNode.getFunctionParameter().getId();
    } else {
      console.error('toDeadNode: unknown node type ' + liveNode.constructor.name);
    }
    return deadNode;
  }

  private static toLiveNode(deadNode, emModule, liveAttributeById, liveFunctionById, liveParameterById) {
    if (deadNode.nodeType === 'AddOpNode') {
      return DeadStore.toLiveBinaryOpNode(deadNode, emModule.AddOpNode, emModule, liveAttributeById, liveFunctionById, liveParameterById);
    } else if (deadNode.nodeType === 'SubOpNode') {
      return DeadStore.toLiveBinaryOpNode(deadNode, emModule.SubOpNode, emModule, liveAttributeById, liveFunctionById, liveParameterById);
    } else if (deadNode.nodeType === 'MulOpNode') {
      return DeadStore.toLiveBinaryOpNode(deadNode, emModule.MulOpNode, emModule, liveAttributeById, liveFunctionById, liveParameterById);
    } else if (deadNode.nodeType === 'DivOpNode') {
      return DeadStore.toLiveBinaryOpNode(deadNode, emModule.DivOpNode, emModule, liveAttributeById, liveFunctionById, liveParameterById);
    } else if (deadNode.nodeType === 'ModOpNode') {
      return DeadStore.toLiveBinaryOpNode(deadNode, emModule.ModOpNode, emModule, liveAttributeById, liveFunctionById, liveParameterById);
    } else if (deadNode.nodeType === 'NumberNode') {
      return emModule.NumberNode.makeUnique(deadNode.value, deadNode.id);
    } else if (deadNode.nodeType === 'AttributeReferenceNode') {
      return emModule.AttributeReferenceNode.makeUnique(liveAttributeById.get(deadNode.referenceAttributeId), deadNode.id);
    } else if (deadNode.nodeType === 'FunctionCallNode') {
      const liveFunction = liveFunctionById.get(deadNode.functionId);
      const liveNode = emModule.FunctionCallNode.makeUnique(liveFunction, deadNode.id);
      const liveParameterById = new Map();
      for (const parameter of Functions.vectorToIterable(liveFunction.getParameters())) {
        liveParameterById.set(parameter.getId(), parameter);
      }
      for (const [parameterId, deadArgument] of Object.entries(deadNode.argumentByParameterId)) {
        const liveParameter = liveParameterById.get(parameterId);
        const liveArgument = this.toLiveNode(deadArgument, emModule, liveAttributeById, liveFunctionById, liveParameterById);
        liveNode.getArgumentCollection().setArgument(liveParameter, liveArgument);
      }
      return liveNode;
    } else if (deadNode.nodeType === 'ParameterNode') {
      const liveParameter = liveParameterById.get(deadNode.parameterId);
      console.assert(liveParameter, deadNode.parameterId);
      return emModule.ParameterNode.makeUnique(liveParameter);
    } else {
      console.error(deadNode.nodeType);
    }
  }

  private static toLiveBinaryOpNode(deadBinaryOpNode, BinaryOpNodeClass: any, emModule, liveAttributeById, liveFunctionById, liveParameterById) {
    const liveA = this.toLiveNode(deadBinaryOpNode.a, emModule, liveAttributeById, liveFunctionById, liveParameterById);
    const liveB = this.toLiveNode(deadBinaryOpNode.b, emModule, liveAttributeById, liveFunctionById, liveParameterById);
    return BinaryOpNodeClass.makeUnique(liveA, liveB, deadBinaryOpNode.id);
  }

  private static toDeadFunction(liveFunction: any) {
    const deadParameters = Functions.vectorToArray(liveFunction.getParameters()).map(liveParameter => ({
      id: liveParameter.getId(),
      name: liveParameter.getName()
    }));
    return {
      id: liveFunction.getId(),
      name: liveFunction.getName(),
      parameters: deadParameters,
      rootNode: this.toDeadNode(liveFunction.getRootNode())
    }
  }

  private static toLiveFunction(deadFunction, emModule) {
    const liveFunction = emModule.Function.makeUnique(deadFunction.name, deadFunction.id);
    for (const deadParameter of deadFunction.parameters) {
      const liveParameter = emModule.FunctionParameter.makeUnique(deadParameter.id, deadParameter.name);
      liveFunction.addParameter(liveParameter);
    }
    return liveFunction;
  }

  private static* getLiveAttributesDeep(liveOrganism: any) {
    yield* Functions.vectorToIterable(liveOrganism.getAttributes());
    for (const suborganism of Functions.vectorToIterable(liveOrganism.getSuborganisms())) {
      yield* this.getLiveAttributesDeep(suborganism);
    }
  }

  private static* getDeadAttributesDeep(deadOrganism: any) {
    yield* deadOrganism.attributes;
    for (const deadSuborganism of deadOrganism.suborganisms) {
      yield* this.getDeadAttributesDeep(deadSuborganism);
    }
  }
}
