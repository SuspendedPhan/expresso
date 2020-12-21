<template>
  <textarea ref="textarea" style="position: absolute; height: auto"></textarea>
</template>

<script>
import Vue from "vue";
import Component from "vue-class-component";
import { Prop, Watch } from "vue-property-decorator";
import Root from "../store/Root";
import CodeMirror from "codemirror-minified";
import { PenPositionRelation } from "../store/Pen";

@Component({
  components: {},
})
export default class Attribute extends Vue {
  @Prop() astNode;

  codeMirror = null;
  pen = Root.penStore;

  mounted() {
    this.codeMirror = CodeMirror.fromTextArea(this.$refs["textarea"], {
      lineNumbers: true,
      viewportMargin: Infinity,
    });
    this.codeMirror.getWrapperElement().style.height = "auto";
    this.codeMirror.setValue(this.text);
    this.codeMirror.on("keydown", (_, event) => {
      event.preventDefault();
      if (this.pen.getPenPosition().positionType === "Node") {
        if (event.key === "Enter") {
          this.pen.setIsQuerying(true);
        } else if (event.key === "ArrowLeft" && !this.pen.getIsQuerying()) {
          this.pen.moveCursorLeft();
        } else if (event.key === "ArrowRight" && !this.pen.getIsQuerying()) {
          this.pen.moveCursorRight();
        } else if (event.key === "Escape" && this.pen.getIsQuerying()) {
          this.pen.setIsQuerying(false);
        }
      }
    });

    this.codeMirror.on("change", () => {
      console.log("change");
    });
    this.codeMirror.on("beforeSelectionChange", (_, { origin }) => {
      console.log('origin');
      console.log(origin);
      if (origin === undefined) {
        return;
      } else if (origin === "*mouse" || origin === null) {
        Vue.nextTick(() => {
          console.log("cursor");
          const anchor = this.codeMirror.getCursor("anchor");
          const head = this.codeMirror.getCursor("head");
          const node = this.annotatedText[anchor.ch].node;
          const isInsideToken =
            this.annotatedText[anchor.ch - 1]?.node === node;
          if (anchor.ch === head.ch && !isInsideToken) {
            this.pen.setPointedNode(node, PenPositionRelation.Before);
          } else {
            this.pen.setPointedNode(node);
          }
        });
      } else {
        console.assert(false);
      }
    });
  }

  @Watch("astNode")
  updateEditor() {
    this.codeMirror.setValue(this.text);
  }

  @Watch("pen.penPosition")
  @Watch("pen.penPosition.relation")
  updateCursor() {
    // for (const marker of this.codeMirror.getAllMarks()) {
    //   marker.clear();
    // }
    // for (let i = 0; i < this.annotatedText.length; i++) {
    //   const annotatedChar = this.annotatedText[i];
    //   if (annotatedChar.node === this.pen.getPointedNode()) {
    //     const q = this.codeMirror.markText(
    //       { line: 0, ch: i },
    //       { line: 0, ch: i + 1 },
    //       {
    //         className: "marked",
    //       }
    //     );
    //   }
    // }
    console.log("pen position");

    if (this.pen.penPosition.positionType === PenPositionRelation.None) {
      return;
    }

    if (this.pen.penPosition.relation === PenPositionRelation.Before) {
      let start = null;
      for (let i = 0; i < this.annotatedText.length; i++) {
        const annotatedChar = this.annotatedText[i];
        if (annotatedChar.node === this.pen.getPointedNode()) {
          start = i;
          break;
        }
      }
      console.assert(start !== null);

      this.codeMirror.setSelection(
        {
          line: 0,
          ch: start,
        },
        {
          line: 0,
          ch: start,
        }
      );
    } else if (this.pen.penPosition.relation === PenPositionRelation.On) {
      let start = null;
      let end = this.annotatedText.length;
      let found = false;
      for (let i = 0; i < this.annotatedText.length; i++) {
        const annotatedChar = this.annotatedText[i];
        if (annotatedChar.node === this.pen.getPointedNode()) {
          if (!found) {
            start = i;
          }
          found = true;
        } else if (found) {
          end = i;
          break;
        }
      }

      if (this.pen.getPointedNode().metaname === "Function") {
        end--;
      }

      if (start !== null) {
        this.codeMirror.setSelection(
          {
            line: 0,
            ch: start,
          },
          {
            line: 0,
            ch: end,
          }
        );
      }
    } else {
      console.assert(false);
    }
  }

  get annotatedText() {
    return Attribute.getAnnotatedText(this.astNode, Root);
  }

  get text() {
    // console.log(this.annotatedText);
    return this.annotatedText.map((t) => t.char).join("");
  }

  onKeydown(event) {
    // console.log(event);
  }

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
</script>

<style>
.marked {
  color: red;
}
</style>