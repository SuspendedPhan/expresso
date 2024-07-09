import { Subject } from "rxjs";
import Evaluator from "./Evaluator";
import CircleComponent from "../domain/Component";
import Renderer from "../renderer/Renderer";
import ScenePool from "../renderer/ScenePool";
import { Attribute, NumberExpr } from "../Domain";

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

        const x$ = new Subject<Attribute>();
        const y$ = new Subject<Attribute>();
        const radius$ = new Subject<Attribute>();
        const circleComponent = new CircleComponent(x$, y$, radius$);
        circle$.next(circleComponent);
        x$.next(new Attribute(new NumberExpr(0)));
        y$.next(new Attribute(new NumberExpr(0)));
        radius$.next(new Attribute(new NumberExpr(1)));

        // TODO: verify that the circles are correctly positioned
    }
}