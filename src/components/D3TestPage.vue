<template>
  <div class="D3TestPage" ref="container">
    <!-- <div
      v-for="forceNode in forceNodes"
      :key="forceNode.id"
      class="forceNode"
      ref="forceNode"
    >
      {{ forceNode.name }}
    </div> -->
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

  mounted() {
    Vue.nextTick(() => this.init());
    const container = this.$refs.container as any;
    this.viewBox = `0 0 ${container.clientWidth} ${container.clientHeight}`;
  }

  init() {
    const container = this.$refs.container as any;
    const organisms = Root.organismCollection.getOrganisms();
    this.forceNodes = organisms.map((t) => ({
      id: t.id,
      name: t.name,
    })) as any;
    this.addLinksForChildren(
      Root.organismCollection.getRoot(),
      this.forceLinks
    );
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
    console.log(container.clientHeight);

    const onFrame = () => {
      Vue.set(this, "forceNodes", this.forceNodes);
      Vue.set(this, "forceLinks", this.forceLinks);
      window.requestAnimationFrame(onFrame);
    };

    const forceNodeDivs = d3
      .select(this.$refs.container)
      .selectAll(".forceNode")
      .data(this.forceNodes)
      .join("div")
      .classed("forceNode", true)
      .style("left", "20px")
      .text((d) => d.name);

    simulation.on("tick", () => {
      this.$forceUpdate();

      forceNodeDivs.style("left", (d, i, nodes) => {
        console.log("");
        console.log(d);
        console.log(i);
        console.log(nodes);
        console.log(nodes[i]);
        console.log(`${d.x - nodes[i].clientWidth / 2}px`);
        console.log("");

        return `${d.x - nodes[i].clientWidth / 2}px`;
      });
      forceNodeDivs.style(
        "top",
        (d, i, nodes) => `${d.y - nodes[i].clientHeight / 2}px`
      );
    });

    onFrame();
  }

  // left(forceNode) {
  //   const value = forceNode.x - ref.clientWidth / 2;
  //   return `${value} px`;
  // }

  // top(forceNode) {
  //   const ref = this.refForForceNode(forceNode);
  //   // console.log(ref);
  //   if (ref === undefined) return "0px";

  //   const value = forceNode.y - ref.clientHeight / 2;
  //   return `${value} px`;
  // }

  private addLinksForChildren(organism, links) {
    for (const child of Root.organismCollection.getChildren(organism)) {
      links.push({ source: organism.id, target: child.id });
    }
  }
}
</script>

<style>
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
</style>