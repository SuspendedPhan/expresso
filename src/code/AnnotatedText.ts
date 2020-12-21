// saving stuff from this class

class AnnotatedText {
  static getAnnotatedText(astNode, root) {
    if (astNode.metaname === "Number") {
      // console.log("number");
      return this.textToAnnotatedText(astNode.value.toString(), astNode);
    } else if (astNode.metaname === "Vector") {
      // <2321, 443>
      console.assert(
        root.nodeCollection.getChildren(astNode) == 2,
        "Attribute.vue vector"
      );
      const xNode = root.nodeCollection.getChild(astNode, 0);
      const yNode = root.nodeCollection.getChild(astNode, 1);
      let answer = [];
      answer.push({ char: "<", node: astNode });
      answer = answer.concat(this.getAnnotatedText(xNode, root));
      answer.push({ char: ",", node: astNode });
      answer = answer.concat(this.getAnnotatedText(yNode, root));
      answer.push({ char: ">", node: astNode });
      return answer;
    } else if (astNode.metaname === "Reference") {
      return this.textToAnnotatedText(
        this.referenceToString(astNode, root),
        astNode
      );
    } else if (astNode.metaname === "Function") {
      const funName = this.funToString(astNode, root);
      const children = Array.from(root.nodeCollection.getChildren(astNode));
      let answer = [];
      answer = answer.concat(this.textToAnnotatedText(funName, astNode));
      answer.push({ char: "(", node: astNode });
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (i !== 0) {
          answer.push({ char: ",", node: astNode });
        }
        answer = answer.concat(this.getAnnotatedText(child, root));
      }
      answer.push({ char: ")", node: astNode });
      return answer;
    } else if (astNode.metaname === "Variable") {
      console.error("Attribute.vue not expecting Variable");
    } else {
      console.error("Attribute.vue Unknown metaname");
    }
  }

  static referenceToString(referenceNode, root) {
    const targetNode = root.nodeStore.getTargetNodeForReference(referenceNode);
    return root.attributeStore.getAttributeForNode(targetNode).name;
  }

  static funToString(funNode, root) {
    const metafun = root.metafunStore.getFromName(funNode.metafunName);
    return metafun.name;
  }

  static textToAnnotatedText(text, astNode) {
    return text.split("").map((t) => ({
      char: t,
      node: astNode,
    }));
  }
}
