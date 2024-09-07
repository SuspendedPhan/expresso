import ScenePool from "src/canvas/CanvasPool";
import { PixiFactory, type PixiFactoryArgs } from "src/canvas/PixiFactory";

export function CanvasFactory(args: PixiFactoryArgs) {
  const pixiFactory = PixiFactory(args);
  const pool = new ScenePool(() => pixiFactory.makeCircle());
  
}