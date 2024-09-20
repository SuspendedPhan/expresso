import { type ICanvas, Application, Graphics } from "pixi.js";

export interface PixiFactoryArgs {
  viewportElement: HTMLElement;
  canvasElement: ICanvas;
}

export type PixiFactory = ReturnType<typeof PixiFactory>;

export function PixiFactory(args: PixiFactoryArgs) {
  const app = new Application();
  app.init({
    resizeTo: args.viewportElement,
    canvas: args.canvasElement,
    antialias: true,
  });

  return {
    makeCircle() {
      // prettier-ignore
      const ret = new Graphics()
                .circle(0, 0, 1)
                .fill(0xffffff);
      app.stage.addChild(ret);
      return ret;
    },
  };
}
