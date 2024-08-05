import MainContext from "src/main-context/MainContext";
import PixiFactory from "./PixiFactory";
import { CanvasContext } from "./CanvasContext";
import { CanvasManager } from "src/canvas/CanvasManager";

export class CanvasMain {
    constructor(ctx: MainContext, pixiFactory: PixiFactory) {
        const canvasCtx = new CanvasContext(ctx, pixiFactory);
        new CanvasManager(canvasCtx);
    }
}