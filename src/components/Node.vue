<template>
  <span class="node-root">
    <span v-if="isPenBeforeMe"><b>|</b></span>
    <span
      v-if="astNode.value != null"
      @click="click"
      :class="{ highlighted }"
      >{{ astNode.value }}</span
    >
    <span
      v-else-if="astNode.metaname === 'Reference'"
      @click="click"
      :class="{ highlighted }"
      >{{ referenceToString(astNode) }}</span
    >
    <span v-else-if="astNode.metaname === 'Vector'">
      <span :class="{ highlighted }" @click="click">&lt;</span>
      <Node :astNode="astNodeChildren[0]" />,
      <Node :astNode="astNodeChildren[1]" />
      <span :class="{ highlighted }" @click="click">&gt;</span>
    </span>
    <span v-else>
      <span @click="click" :class="['function', { highlighted }]"
        >{{ funToString(astNode) }}(</span
      >
      <span v-for="(child, index) in astNodeChildren" :key="child.id">
        <Node :astNode="child" />
        <span v-if="index !== astNodeChildren.length - 1">, </span>
      </span>
      <span :class="{ highlighted }">)</span>
    </span>
    <span v-if="isPenAfterMe"><b>|</b></span>
    <NodePicker
      ref="searcher"
      v-if="picking"
      :nodeToReplace="astNode"
      @blur="blur"
      :class="['searcher', { 'bring-to-front': picking }]"
    />
  </span>
</template>

<script>
import { PenPositionRelation } from "@/store/Pen";
import Root from "../store/Root";
import NodePicker from "./NodePicker";

export default {
  name: "Node",
  components: {
    NodePicker,
  },
  props: {
    astNode: { value: 0 },
  },
  data: () => {
    return {
      Root: Root,
      nodeStore: Root.nodeStore,
    };
  },
  computed: {
    highlighted() {
      return (
        Root.penStore.getPenPosition().positionType === "Node" &&
        Root.penStore.getPenPosition().referenceNodeId === this.astNode.id &&
        Root.penStore.getPenPosition().relation === PenPositionRelation.On
      );
    },
    isPenBeforeMe() {
      return (
        Root.penStore.getPenPosition().positionType === "Node" &&
        Root.penStore.getPenPosition().referenceNodeId === this.astNode.id &&
        Root.penStore.getPenPosition().relation === PenPositionRelation.Before
      );
    },
    isPenAfterMe() {
      return (
        Root.penStore.getPenPosition().positionType === "Node" &&
        Root.penStore.getPenPosition().referenceNodeId === this.astNode.id &&
        Root.penStore.getPenPosition().relation === PenPositionRelation.After
      );
    },
    picking() {
      return (
        Root.pen.getPenPosition().referenceNodeId === this.astNode.id &&
        Root.penStore.getIsQuerying()
      );
    },
    astNodeChildren() {
      Root.nodeCollection.nodeParents.length; // trigger reactive
      return Root.nodeStore.getChildren(this.astNode).toArray();
    },
  },
  methods: {
    click() {
      Root.penStore.setPointedNode(this.astNode);
      console.log("click");
      console.log(this.astNode);
    },
    blur() {
      // Actions.blurCursor();
    },
    referenceToString(referenceNode) {
      const targetNode = Root.nodeStore.getTargetNodeForReference(
        referenceNode
      );
      return Root.attributeStore.getAttributeForNode(targetNode).name;
    },
    funToString(funNode) {
      const metafun = Root.metafunStore.getFromName(funNode.metafunName);
      return metafun.name;
    },
  },
  watch: {
    picking() {
      if (this.picking) {
        this.$nextTick().then(() => {
          this.$refs["searcher"].focus();
        });
      }
    },
  },
};
</script>

<style scoped>
.searcher {
  position: absolute;
  top: 100%;
}
.node-root {
  position: relative;
}
.function {
  text-transform: lowercase;
}
.highlighted {
  font-weight: bold;
}
.bring-to-front {
  z-index: 1;
}
</style>
