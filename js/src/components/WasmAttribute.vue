<template>
  <div>
    <div class="flex flex-col space-y-2">
      <div class="flex justify-between">
        <InlineInput
            :value='name'
            @input='onNameChange'
            :readonly="attribute.isFrozen"
        >
          <span class="text-attribute">{{ name }}</span>
        </InlineInput>
<!--        <button v-if="!attribute.isFrozen" @click="remove">Remove</button>-->
      </div>
      <div ref="textarea"></div>
    </div>
    <NodePicker
        ref="searcher"
        v-if="picking"
        @blur="blur"
        :class="['searcher', { 'bring-to-front': picking }]"
    />
  </div>
</template>

<script lang="ts">

import Component from "vue-class-component";
import {Prop, Watch} from "vue-property-decorator";
import Vue from "vue";
import WasmNode from "@/components/WasmNode.vue";

import Root from "../store/Root";
import NodePicker from "./NodePicker.vue";
import InlineInput from "./InlineInput.vue";
import Quill from "quill";
import AttributeModel from "@/models/Attribute";

@Component({
  components: {WasmNode, NodePicker, InlineInput}
})
export default class WasmAttribute extends Vue {
  @Prop() attribute;

  name = null;
  rootNode = null;
  quill = null as any;

  async mounted() {
    this.name = this.attribute.getName();
    if (this.attribute.constructor.name === 'EditableAttribute') {
      this.rootNode = this.attribute.getRootNode();
    }
    this.oldMounted();
  }

  oldMounted() {
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

    this.setText(this.quill, this.getText());

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
      } else if (event.key === "a" && event.altKey) {
        Root.nodeCollection.convertToAttribute(Root.pen.getPointedNode());
        Root.save();
        this.updateEditorIfSelected();
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

    this.pen.events.on("afterPenCommit", () => this.updateEditorIfSelected());

    AttributeModel.onSomeAttributeChanged.sub(() => this.updateEditor());
  }

  blur() {
    this.quill.focus();
  }

  remove() {
    this.attributeModel.inlineWithDefaults();
    Root.save();
  }

  startEditingName() {
    if (!this.attributeModel.isFrozen) {
      this.inputName = this.attributeModel.name;
      this.isEditingName = true;
      Vue.nextTick(() => this.$refs["nameInput"].focus());
    }
  }

  commitName() {
    this.attributeModel.name = this.inputName;
    this.isEditingName = false;
  }

  onInputKeypress(event) {
    if (event.key === "Enter") {
      this.commitName();
    }
  }

  onInputBlur() {
    this.isEditingName = false;
  }

  onNameChange(value) {
    this.attributeModel.name = value;
    Root.save();
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
    if (AttributeModel.attributes.indexOf(this.attributeModel) !== -1) {
      this.setText(this.quill, this.getText());
    }
  }

  updateEditorIfSelected() {
    if (this.pen.getSelectedAttribute() !== this.attributeModel) return;
    this.updateEditor();
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