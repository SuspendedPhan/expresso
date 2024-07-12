// @ts-nocheck

import Evaluator from "../evaluator/Evaluator";
import ScenePool from "./ScenePool";

export default class Renderer {
    public constructor(evaluator: Evaluator, pool: ScenePool) {
        evaluator.evaluate$().subscribe((evaluatedCircleClones) => {
            pool.releaseCircles();
            for (const evaluatedCircleClone of evaluatedCircleClones) {
                const circle = pool.takeCircle();
                circle.visible = true;
                circle.x = evaluatedCircleClone.x;
                circle.y = evaluatedCircleClone.y;
                circle.scale.x = evaluatedCircleClone.radius;
                circle.scale.y = evaluatedCircleClone.radius;
            }
        });
    }
}