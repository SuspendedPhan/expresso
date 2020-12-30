<template>
  <div>
    <div ref="textarea"></div>
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
import Quill from "quill";

@Component({
  components: { NodePicker },
})
export default class Attribute extends Vue {
  @Prop() astNode;
  @Prop() attributeModel;

  quill = null;
  pen = Root.penStore;
  dirtyCounter = 0;

  mounted() {
    this.quill = new Quill(this.$refs["textarea"], {});
    // this.quill = new Quill(this.$refs["textarea"], { readOnly: true });

    this.quill.setText(this.getText(), "silent");
    this.quill.setSelection(1, 1, "silent");
    this.quill.focus();

    this.quill.root.addEventListener("keydown", (event) => {
      if (event.key.length === 1) {
        this.pen.setIsQuerying(true);
        this.pen.setQuery(event.key);
        event.preventDefault();
        event.stopPropagation();
      }

      console.log("keydown");
      console.log(this.pen.selection);
    });

    this.quill.keyboard.addBinding({ key: "Escape" }, () => {
      if (this.pen.isQuerying) {
        this.pen.setIsQuerying(false);
      }
    });

    this.quill.on("text-change", (delta, oldDelta, source) => {
      console.log(delta);
      Vue.nextTick(() => {
        this.quill.setText(oldDelta.ops[0].insert, "silent");
        this.updateCursor();
      });
    });

    this.quill.on("selection-change", (range, oldRange, source) => {
      if (range === null) return;
      if (this.pen.getIsQuerying()) return;
      if (source !== 'user') return;

      console.log("setting sel " + source);

      this.pen.setSelection({
        attributeId: this.attributeModel.id,
        startIndex: range.index,
        endIndex: range.index + range.length,
      });
    });

    this.pen.events.on("afterCommitGhostEdit", () => this.updateEditor());
  }

  blur() {
    this.quill.focus();
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
      Root.penStore.getIsQuerying() &&
      Root.pen.getSelectedAttribute() === this.attributeModel
    );
  }

  updateEditor() {
    if (this.pen.getSelectedAttribute() !== this.attributeModel) return;
    console.error("updateEditor");
    this.quill.setText(this.getText(), "silent");
    this.updateCursor();
  }

  @Watch("pen.selection")
  updateCursor() {
    if (this.pen.getIsQuerying()) return;

    if (this.pen.getSelection()?.attributeId === this.attributeModel.id) {
      const selection = this.pen.getSelection();
      this.quill.setSelection(
        selection.startIndex,
        selection.endIndex - selection.startIndex,
        "silent"
      );
      console.error(this.quill.getSelection());
    }
  }

  getText() {
    return Root.pen.getTextForAttribute(this.attributeModel);
  }
}
</script>

<style>
.marked {
  color: red;
}
.ql-clipboard {
  display: none;
}
.ql-editor {
  overflow-y: auto;
}
p {
  margin: 0;
}
</style>