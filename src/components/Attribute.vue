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

    this.quill.setText(this.getText(), "silent");

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
      Vue.nextTick(() => {
        this.quill.setText(oldDelta.ops[0].insert, "silent");
        this.updateCursor();
      });
    });

    this.quill.on("selection-change", (range, oldRange, source) => {
      if (range === null) return;
      if (this.pen.getIsQuerying()) return;
      if (source !== "user") return;

      this.pen.setSelection({
        attributeId: this.attributeModel.id,
        startIndex: range.index,
        endIndex: range.index + range.length,
      });
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