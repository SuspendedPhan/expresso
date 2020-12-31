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

  mounted() {
    Quill.register(Quill.import("attributors/class/color"), true);
    Quill.register(Quill.import("attributors/class/background"), true);
    var bindings = {
      // This will overwrite the default binding also named 'tab'
      enter: {
        key: 13,
        handler: function () {
          // suppress
        },
      },
    };
    this.quill = new Quill(this.$refs["textarea"], {
      modules: {
        keyboard: {
          bindings: bindings,
        },
      },
    });
    this.quill.root.setAttribute("spellcheck", false);

    this.setText(this.quill, this.getText(1));

    this.quill.root.addEventListener("keydown", (event) => {
      if (event.key.length === 1 && !event.ctrlKey && !event.altKey) {
        this.pen.setIsQuerying(true);
        this.pen.setQuery(event.key);
        event.preventDefault();
        event.stopPropagation();
      } else if (event.key === "Enter") {
        this.pen.setIsQuerying(true);
        event.preventDefault();
        event.stopPropagation();
      } else if (event.key === "r" && event.altKey) {
        if (!Root.pen.isCursorInserting()) {
          Root.pen.tryPromoteSelectionToRoot();
        }
      }
    });

    this.quill.on("text-change", (delta, oldDelta, source) => {
      if (source !== "user") return;
      Vue.nextTick(() => {
        this.setText(this.quill, oldDelta.ops[0].insert);
      });
    });

    this.quill.on("selection-change", (range, oldRange, source) => {
      if (source !== "user") return;
      if (this.pen.getIsQuerying()) return;

      if (range === null) {
        this.pen.setSelection(null);
      } else {
        this.pen.setSelection({
          attributeId: this.attributeModel.id,
          startIndex: range.index,
          endIndex: range.index + range.length,
        });
      }
    });

    this.pen.events.on("afterPenCommit", () => this.updateEditor());
  }

  blur() {
    this.quill.focus();
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
      Root.penStore.getIsQuerying() &&
      Root.pen.getSelectedAttribute() === this.attributeModel
    );
  }

  updateEditor() {
    if (this.pen.getSelectedAttribute() !== this.attributeModel) return;
    this.setText(this.quill, this.getText());
  }

  setText(quill, text) {
    this.quill.removeFormat(0, this.quill.getLength());
    this.quill.setText(text, "silent");
    const annotatedText = Root.pen.getAnnotatedTextForAttribute(
      this.attributeModel
    );

    for (let i = 0; i < annotatedText.length; i++) {
      const annotatedChar = annotatedText[i];
      const node = annotatedChar.node;
      if (node === null) continue;
      if (node.metaname === "Function") {
        this.quill.formatText(i, 1, "color", "function", "silent");
      } else if (node.metaname !== "Number" && node.metaname !== "Vector") {
        this.quill.formatText(i, 1, "color", "variable", "silent");
      }
    }
    this.updateCursor();
  }

  @Watch("pen.selection")
  updateCursor() {
    if (this.pen.getIsQuerying()) return;

    this.quill.formatText(
      0,
      this.quill.getLength(),
      "background",
      false,
      "silent"
    );

    if (this.pen.getSelection()?.attributeId === this.attributeModel.id) {
      const selection = this.pen.getSelection();
      this.quill.setSelection(
        selection.startIndex,
        selection.endIndex - selection.startIndex,
        "silent"
      );
      const length = selection.endIndex - selection.startIndex;

      this.quill.formatText(
        selection.startIndex,
        length,
        "background",
        "selected",
        "silent"
      );
    }
  }

  getText() {
    return Root.pen.getTextForAttribute(this.attributeModel);
  }
}
</script>

<style scoped>
</style>