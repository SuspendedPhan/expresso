<template>
  <div class="D3TestPage" ref="container">
    <svg class="svg" ref="svg" :viewBox="viewBox">
      <g stroke="#fff" stroke-width="1">
        <line
          v-for="(forceLink, index) in forceLinks"
          :key="index"
          :x1="forceLink.source.x"
          :x2="forceLink.target.x"
          :y1="forceLink.source.y"
          :y2="forceLink.target.y"
        ></line>
      </g>
    </svg>
    <div
      v-for="forceNode in forceNodes"
      :key="`${forceNode.id}|${forceNode.storetype}`"
      :class="[
        'forceNode',
        {
          attribute: forceNode.storetype === undefined,
          organism: forceNode.storetype === 'Organism',
          node: forceNode.storetype === 'node',
        },
      ]"
      :style="{ left: left(forceNode), top: top(forceNode) }"
      :ref="refNameForForceNode(forceNode)"
    >
      {{ forceNode.name }}
    </div>
  </div>
</template>

<script lang='ts'>
import Vue from "vue";
import Component from "vue-class-component";
import { Prop, Watch } from "vue-property-decorator";
import * as d3 from "d3";
import Root from "../store/Root";
import Functions from "@/code/Functions";

@Component({})
export default class D3TestPage extends Vue {
  forceNodes = [];
  forceLinks = [];
  viewBox = "0 0 50 50";

  private mounted() {
    Vue.nextTick(() => this.init());
    const container = this.$refs.container as any;
    this.viewBox = `0 0 ${container.clientWidth} ${container.clientHeight}`;
  }

  private init() {
    const container = this.$refs.container as any;

    for (const organism of Root.organismCollection.getOrganisms()) {
      this.addNodesAndLinksForOrganism(
        organism,
        this.forceNodes,
        this.forceLinks
      );
    }

    const simulation = d3
      .forceSimulation(this.forceNodes)
      .force(
        "link",
        d3
          .forceLink(this.forceLinks)
          .id((t) => t.id)
          .distance(100)
      )
      .force(
        "center",
        d3.forceCenter(container.clientWidth / 2, container.clientHeight / 2)
      )
      .force("charge", d3.forceManyBody());

    simulation.on("tick", () => {
      this.$forceUpdate();
    });
  }

  private left(forceNode) {
    const refArray = this.$refs[this.refNameForForceNode(forceNode)] as any;
    if (refArray === undefined) return "0px";

    const ref = refArray[0];
    const value = forceNode.x - ref.clientWidth / 2;
    return `${value}px`;
  }

  private top(forceNode) {
    const refArray = this.$refs[this.refNameForForceNode(forceNode)] as any;
    if (refArray === undefined) return "0px";

    const ref = refArray[0];
    const value = forceNode.y - ref.clientHeight / 2;
    return `${value}px`;
  }

  private refNameForForceNode(forceNode) {
    return `forceNode|${forceNode.id}`;
  }

  private addNodesAndLinksForOrganism(organism, forceNodes, forceLinks) {
    if (forceNodes.find(t => t.id === organism.id) !== undefined) {
      console.log('Duplicate');
      console.log(organism);
    }
    forceNodes.push({
      id: organism.id,
      name: organism.name,
      storetype: organism.storetype,
    });

    for (const child of Root.organismCollection.getChildren(organism)) {
      forceLinks.push({ source: organism.id, target: child.id });
      this.addNodesAndLinksForOrganism(child, forceNodes, forceLinks);
    }

    for (const attribute of Root.attributeCollection.getAttributesForOrganism(
      organism
    )) {
      if (forceNodes.find(t => t.id === attribute.id) !== undefined) {
        console.log('Duplicate');
        console.log(attribute);
      }
      forceNodes.push({
        id: attribute.id,
        name: attribute.name,
        storetype: attribute.storetype,
      });
      forceLinks.push({ source: organism.id, target: attribute.id });

      const rootNode = Root.attributeCollection.getRootNode(attribute);
      forceLinks.push({ source: attribute.id, target: rootNode.id });
      this.addNodesAndLinksForNode(rootNode, forceNodes, forceLinks);
    }
  }

  private addNodesAndLinksForNode(node, forceNodes, forceLinks) {
    if (forceNodes.find(t => t.id === node.id) !== undefined) {
      console.log('Duplicate');
      console.log(node);
    }
    forceNodes.push({
      id: node.id,
      name: node.value ?? node.metafunName ?? node.metaname,
      storetype: node.storetype,
    });
    for (const child of Root.nodeCollection.getChildren(node)) {
      forceLinks.push({ source: node.id, target: child.id });
      this.addNodesAndLinksForNode(child, forceNodes, forceLinks);
    }
  }
}
</script>

<style scoped>
.forceNode {
  position: absolute;
  background-color: white;
}
.svg {
  position: absolute;
}
.D3TestPage {
  position: fixed;
  top: 200px;
  bottom: 200px;
  left: 200px;
  right: 200px;
  background: rgb(218, 218, 218);
}
.organism {
  background-color: rgb(206, 168, 255);
}
.node {
  background-color: rgb(168, 196, 255);
}
.attribute {
  background-color: rgb(168, 255, 219);
}
</style>