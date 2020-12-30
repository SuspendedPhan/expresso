<template>
  <div>
    <textarea
      ref="textarea"
      style="position: absolute; height: auto"
    ></textarea>
    <NodePicker
      ref="searcher"
      v-if="picking"
      @blur="blur"
      :class="['searcher', { 'bring-to-front': picking }]"
    />
  </div>
</template>

<script>
import Vue from "vue";
import Component from "vue-class-component";
import { Prop, Watch } from "vue-property-decorator";
import Root from "../store/Root";
import CodeMirror from "codemirror-minified";
import { PenPositionRelation } from "../store/Pen";
import NodePicker from "./NodePicker";
import Functions from "@/code/Functions";

@Component({
  components: { NodePicker },
})
export default class Attribute extends Vue {
  @Prop() astNode;
  @Prop() attributeModel;

  codeMirror = null;
  codeMirrorWrapper = null;
  pen = Root.penStore;
  dirtyCounter = 0;

  mounted() {
    // this.codeMirror = CodeMirror.fromTextArea(this.$refs["textarea"], {
    //   lineNumbers: true,
    //   viewportMargin: Infinity,
    //   readOnly: true,
    // });
    this.codeMirrorWrapper = this.codeMirror.getWrapperElement();
    this.codeMirror.getWrapperElement().style.height = "auto";
    this.codeMirror.setValue(this.getText());
    this.codeMirror.on("keydown", (_, event) => {
      if (event.key === "Enter") {
        this.pen.setIsQuerying(true);
      } else if (event.key === "Escape" && this.pen.getIsQuerying()) {
        this.pen.setIsQuerying(false);
      }
    });
    // this.codeMirror.on("keydown", (_, event) => {
    //   event.preventDefault();
    // });

    // this.codeMirror.on("keyup", (_, event) => {
    //   event.preventDefault();
    // });

    // this.codeMirror.on("keypress", (_, event) => {
    //   event.preventDefault();
    // });

    this.codeMirror.on("change", () => {
      console.log('change');
    });
    this.codeMirror.getDoc().on("beforeSelectionChange", (cm, { origin }) => {
      // if (cm.getWrapperElement() !== this.codeMirrorWrapper) return;

      // console.log(cm);
      // console.assert(false);
      // console.log(cm === this.codeMirror);
      console.log('before');
      console.log(cm);
      // console.log(cm.getWrapperElement());
      // console.log(this.codeMirrorWrapper);
      if (origin === undefined) return;
      Vue.nextTick(() => {
        const anchorIndex = this.codeMirror.getCursor("anchor").ch;
        const headIndex = this.codeMirror.getCursor("head").ch;
        this.pen.setSelection({
          attributeId: this.attributeModel.id,
          startIndex: anchorIndex,
          endIndex: headIndex,
        });
      });
    });

    this.pen.events.on('afterPenCommit', () => this.updateEditor());
  }

  blur() {
    this.codeMirror.focus();
    this.dirtyCounter++;
    Vue.nextTick(() => {
      this.dirtyCounter++;
    });
    console.log("blur");
  }

  @Watch("picking")
  focusSearcher() {
    if (this.picking) {
      this.$nextTick().then(() => {
        this.$refs["searcher"].focus();
      });
    }
  }

  get picking() {
    return (
      // Root.pen.getPenPosition().referenceNodeId === this.astNode.id &&
      Root.penStore.getIsQuerying()
    );
  }

  // get key() {
  //   console.log('key');
  //   const node = Root.attributeCollection.getRootNode(this.attributeModel);
  //   const descendants = Array.from(Functions.traversePostOrder(node, t => Root.nodeCollection.getChildren(t)));
  //   return descendants.map(t => t.id).join('|');
  // }

  // @Watch("key")
  updateEditor() {
    console.log('asdf');
    this.codeMirror.setValue(this.getText());
  }

  @Watch("pen.selection")
  updateCursor() {
    this.codeMirror.setSelection(
      {
        line: 0,
        ch: this.pen.getSelection().startIndex,
      },
      {
        line: 0,
        ch: this.pen.getSelection().endIndex,
      }
    );
  }

  getText() {
    console.log('asdf23');
    return Root.pen.getTextForAttribute(this.attributeModel);
  }
}
</script>

<style>
.marked {
  color: red;
}
</style>