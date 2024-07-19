import MainContext from "src/main-context/MainContext";
import PixiFactory from "./PixiFactory";
import { SceneContext } from "./SceneContext";
import { SceneManager } from "./SceneManager";

export class SceneMain {
    constructor(ctx: MainContext, pixiFactory: PixiFactory) {
        const sceneCtx = new SceneContext(ctx, pixiFactory);
        new SceneManager(sceneCtx);
    }
}