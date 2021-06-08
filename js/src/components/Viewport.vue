<template>
  <div class="viewport" ref="viewport">
    <canvas
      :width="width"
      :height="height"
      ref="canvas"
      @mousemove="testMethod($event)"
    >
    </canvas>
    <div class="fps">{{ framerate }}</div>
    <div class="nodes">nodes: {{ Root.nodeCollection.nodes.items.length }}</div>
  </div>
</template>

<script lang='ts'>
import Root, { RenderShape } from "../store/Root";
import fps from "fps";
import numeral from "numeral";
import Component, {Options, Vue} from "vue-class-component";
import * as PIXI from "pixi.js";
import deePool from "deepool";
import { SignalDispatcher } from "ste-signals";

(window as any).root = Root;

@Options({})
export default class Viewport extends Vue {
  width = 0;
  height = 0;
  framerate = 0;
  Root = Root;
  mostRecentClickCoordinates = { x: 0, y: 0 };
  app = null as any;
  circlePool = null as any;
  circles = [] as any[];
  rectanglePool = null as any;
  rectangles = [] as any[];
  ticker = fps({ every: 10 });

  created() {
    this.ticker.on(
      "data",
      (framerate) => (this.framerate = numeral(framerate).format("0"))
    );
  }

  mounted() {
    this.app = new PIXI.Application({
      resizeTo: this.$refs["viewport"] as any,
      view: this.$refs["canvas"] as any,
      antialias: true,
    });
    this.circlePool = deePool.create(this.makeCircle);
    this.circlePool.grow(100);
    this.rectanglePool = deePool.create(this.makeRectangle);
    this.rectanglePool.grow(100);
    this.update();
  }

  testMethod(event) {
    this.mostRecentClickCoordinates = {
      x: event.clientX,
      y: event.clientY,
    };
  }

  update() {
    if (this.$refs.viewport === undefined) return;

    this.ticker.tick();
    const viewport = this.$refs.viewport as any;
    const canvas = this.$refs.canvas;
    this.width = viewport.clientWidth;
    this.height = viewport.clientHeight;
    Root.setWindowSize(this.width, this.height);
    Root.setMouseLocation(
      this.mostRecentClickCoordinates.x,
      this.mostRecentClickCoordinates.y
    );

    for (const circle of this.circles) {
      circle.visible = false;
    }

    for (const rectangle of this.rectangles) {
      rectangle.visible = false;
    }

    const doneRenderingSignal = new SignalDispatcher();
    const renderCommands = Root.computeRenderCommands();
    for (const renderCommand of renderCommands) {
      const alpha = renderCommand.alpha ?? 0.5;
      const hue = renderCommand.hue ?? 0;
      const saturation = renderCommand.saturation ?? 0;
      const lightness = renderCommand.lightness ?? 0.5;
      const fillStyle = `hsla(${hue * 360}, ${saturation * 100}%, ${
        lightness * 100
      }%, ${alpha})`;
      if (renderCommand.shape === RenderShape.Circle) {
        const circle = this.circlePool.use();
        circle.visible = true;
        circle.x = renderCommand.x;
        circle.y = renderCommand.y;
        circle.scale.x = renderCommand.radius;
        circle.scale.y = renderCommand.radius;
        // circle.tint = ''
        doneRenderingSignal.sub(() => this.circlePool.recycle(circle));
      } else if (renderCommand.shape === RenderShape.Rectangle) {
        const centerx = renderCommand.x - renderCommand.width / 2;
        const centery = renderCommand.y - renderCommand.height / 2;
        const rectangle = this.rectanglePool.use();
        rectangle.visible = true;
        rectangle.x = centerx;
        rectangle.y = centery;
        rectangle.scale.x = renderCommand.width;
        rectangle.scale.y = renderCommand.height;
        doneRenderingSignal.sub(() => this.rectanglePool.recycle(rectangle));
      } else if (renderCommand.shape === RenderShape.Line) {
      }
    }

    doneRenderingSignal.dispatch();

    window.requestAnimationFrame(this.update);
  }

  makeCircle() {
    const ret = new PIXI.Graphics();
    ret.beginFill(0x9966ff);
    ret.drawCircle(0, 0, 1);
    ret.endFill();
    this.circles.push(ret);
    this.app.stage.addChild(ret);
    return ret;
  }

  makeRectangle() {
    const ret = new PIXI.Graphics();
    ret.beginFill(0x9966ff);
    ret.drawRect(0, 0, 1, 1);
    ret.endFill();
    this.rectangles.push(ret);
    this.app.stage.addChild(ret);
    return ret;
  }
}
</script>

<style scoped>
.fps {
  position: absolute;
  bottom: 0;
  right: 0;
  margin: 20px;
  background-color: white;
  width: 50px;
  text-align: center;
}
.nodes {
  position: absolute;
  bottom: 0;
  right: 70px;
  margin: 20px;
  background-color: white;
  padding-left: 10px;
  padding-right: 10px;
  text-align: center;
}
</style>
