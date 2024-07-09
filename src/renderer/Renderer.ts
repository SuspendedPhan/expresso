import Evaluator from "../evaluator/Evaluator";
import PixiRenderer from "./PixiRenderer";

export default class Renderer {
    public constructor(evaluator: Evaluator, pixi: PixiRenderer) {
        evaluator.evaluate$().subscribe((evaluatedCircleClones) => {
            pixi.releaseCircles();
            for (const evaluatedCircleClone of evaluatedCircleClones) {
                const circle = pixi.takeCircle();
                circle.visible = true;
                circle.x = evaluatedCircleClone.x;
                circle.y = evaluatedCircleClone.y;
                circle.scale.x = evaluatedCircleClone.radius;
                circle.scale.y = evaluatedCircleClone.radius;
            }
        });
    }
}