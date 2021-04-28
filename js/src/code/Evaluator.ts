import Root, { RenderShape } from "@/store/Root";
import { DateTime } from "luxon";
import Attribute from "@/models/Attribute";
import Node from "@/models/Node";
import Metastruct from "@/models/Metastruct";

export default class Evaluator {
  private static get attributeCollection() {
    return Root.attributeCollection;
  }

  private static get organismCollection() {
    return Root.organismCollection;
  }

  private static get nodeStore() {
    return Root.nodeStore;
  }

  private static get time() {
    return Root.time;
  }

  private static get windowSize() {
    return Root.windowSize;
  }

  private static get metaorganismCollection() {
    return Root.metaorganismCollection;
  }

  public static *computeRenderCommands(): Iterable<any> {
    const organism = this.organismCollection.getRoot();
    if (organism === null) return;

    this.time.setFrameTime(DateTime.utc());
    const universeDurationMillis = this.time
      .getElapsedUniverseTime()
      .as("milliseconds");
    const time01 =
      universeDurationMillis /
      this.time.getUniverseLifespan().as("milliseconds");

    const timeRoot = this.attributeCollection.getRootNodeFromName(
      organism,
      "time",
      false
    );
    const time01Root = this.attributeCollection.getRootNodeFromName(
      organism,
      "time01",
      false
    );
    const windowHeightRoot = this.attributeCollection.getRootNodeFromName(
      organism,
      "window.height",
      false
    );
    const windowWidthRoot = this.attributeCollection.getRootNodeFromName(
      organism,
      "window.width",
      false
    );
    const windowCenterRoot = this.attributeCollection.getRootNodeFromName(
      organism,
      "window.center",
      false
    );

    const windowCenterAttribute = Attribute.getAttributeFromName(
      organism,
      "window.center"
    );

    if (timeRoot) {
      this.nodeStore.putChild(
        timeRoot,
        0,
        this.nodeStore.addNumber(DateTime.utc().toMillis() / 1000)
      );
      // this.nodeStore.putChild(timeRoot, 0, this.nodeStore.addNumber(universeDurationMillis));
    }
    if (windowHeightRoot) {
      this.nodeStore.putChild(
        windowHeightRoot,
        0,
        this.nodeStore.addNumber(this.windowSize.height)
      );
    }
    if (windowWidthRoot) {
      this.nodeStore.putChild(
        windowWidthRoot,
        0,
        this.nodeStore.addNumber(this.windowSize.width)
      );
    }
    if (windowCenterAttribute) {
      windowCenterAttribute.assignVector(
        this.windowSize.width / 2,
        this.windowSize.height / 2
      );
    }
    if (time01Root) {
      this.nodeStore.putChild(time01Root, 0, this.nodeStore.addNumber(time01));
    }
    yield* this.computeRenderCommandsForOrganism(organism);
  }

  private static *computeRenderCommandsForOrganism(organism): Iterable<any> {
    const clonesRoot = this.attributeCollection.getRootNodeFromName(
      organism,
      "clones",
      false
    );
    const clones = clonesRoot === undefined ? 1 : this.evalNode(clonesRoot);

    const metaorganism = this.metaorganismCollection.getFromId(
      organism.metaorganismId
    ) as any;

    for (let cloneNumber = 0; cloneNumber < clones; cloneNumber++) {
      if (clonesRoot) {
        Evaluator.assignAttribute(organism, "cloneNumber", cloneNumber);
        Evaluator.assignAttribute(
          organism,
          "cloneNumber01",
          cloneNumber / (clones - 1)
        );
        Evaluator.assignAttribute(
          organism,
          "radialCloneNumber01",
          cloneNumber / clones
        );
      }

      if (metaorganism.renderShape !== RenderShape.None) {
        const renderCommand = {} as any;
        renderCommand.shape = metaorganism.renderShape;
        for (const attribute of this.attributeCollection.getEditables(
          organism
        )) {
          if (attribute.name === "clones") continue;

          const value = this.evalNode(
            this.attributeCollection.getRootNode(attribute)
          );
          // const value = this.attributeCollection.getRootNode(attribute).eval();
          if (attribute.name === "xy") {
            renderCommand.x = value.x;
            renderCommand.y = value.y;
          } else {
            renderCommand[attribute.name] = value;
          }
        }
        yield renderCommand;
      }

      for (const organ of this.organismCollection.getChildren(organism)) {
        yield* this.computeRenderCommandsForOrganism(organ);
      }
    }
  }

  private static evalNode(node) {
    if (node.metaname === "Number") {
      return node.value;
    } else if (node.metaname === "Variable") {
      return this.evalNode(Node.getChild(node, 0));
    } else if (node.metaname === "Reference") {
      return this.evalNode(Node.getFromId(node.targetNodeId));
    } else if (node.metaname === "Function") {
      const metafun = Root.metafunStore.getFromName(node.metafunName) as any;
      const children = Array.from(Node.getChildren(node));
      const args = children.map(n => this.evalNode(n));
      if ("evalTypedArgs" in metafun) {
        const typedArgs = [] as any;
        for (let i = 0; i < children.length; i++) {
          typedArgs.push({ datatype: children[i].datatype, value: args[i] });
        }
        return metafun.evalTypedArgs(...typedArgs);
      } else {
        return metafun.eval(...args);
      }
    } else if (node.metaname === "Struct") {
      const metastruct = Metastruct.fromId(node.metastructId);
      const ret = {};
      for (let i = 0; i < metastruct.members.length; i++) {
        const member = metastruct.members[i];
        ret[member.name] = this.evalNode(Node.getChild(node, i));
      }
      return ret;
    } else if (node.metaname === "Void") {
      return undefined;
    } else if (node.metaname === "StructMemberReference") {
      const targetVariableNode = Node.getFromId(node.targetVariableNodeId);
      const childNode = Node.getChild(targetVariableNode, 0);
      if (childNode.metaname === "Struct") {
        const memberNode = Node.getChild(childNode, node.memberIndex);
        return this.evalNode(memberNode);
      } else if (childNode.metaname === "Function") {
        const datatype = targetVariableNode.datatype;
        const memberName = datatype.members[node.memberIndex].name;
        return this.evalNode(childNode)[memberName];
      } else {
        console.assert(false, childNode);
        return undefined;
      }
    } else {
      console.assert(false);
    }
  }

  private static assignAttribute(
    organism,
    attributeName: string,
    attributeValue: number
  ) {
    const rootNode = this.attributeCollection.getRootNodeFromName(
      organism,
      attributeName
    );
    this.nodeStore.getChild(rootNode, 0).value = attributeValue;
  }
}
