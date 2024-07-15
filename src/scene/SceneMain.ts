import MainContext from "../MainContext";
import PixiFactory from "./PixiFactory";
import { SceneContext } from "./SceneContext";
import { SceneObjectManager } from "./SceneObjectManager";

export class SceneMain {
    constructor(ctx: MainContext, pixiFactory: PixiFactory) {
        const sceneCtx = new SceneContext(ctx, pixiFactory);
        new SceneObjectManager(sceneCtx);
    }
}