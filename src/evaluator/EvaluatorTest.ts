import { Subject } from "rxjs";
import Evaluator from "./Evaluator";
import CircleComponent from "../domain/Component";
import Renderer from "../renderer/Renderer";
import ScenePool from "../renderer/ScenePool";

export default class EvaluatorTest {
    public test() {
        const circles = [];

        const circle$ = new Subject<CircleComponent>();
        const evaluator = new Evaluator(circle$);
        new Renderer(evaluator, new ScenePool(() => {
            const circle = {};
            circles.push(circle);
            return circle;
        }));
    }
}