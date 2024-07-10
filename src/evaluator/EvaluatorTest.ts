// import { Subject } from "rxjs";
// import Evaluator from "./Evaluator";
// import CircleComponent from "../domain/Component";
// import Renderer from "../renderer/Renderer";
// import ScenePool from "../renderer/ScenePool";
// import { ReadonlyAttribute, NumberExpr } from "../Domain";

// export default class EvaluatorTest {
//   public test() {
//     const circles: any[] = [];

//     const circle$ = new Subject<CircleComponent>();
//     const evaluator = new Evaluator(circle$);
//     new Renderer(
//       evaluator,
//       new ScenePool(() => {
//         const circle = { scale: {} };
//         circles.push(circle);
//         return circle;
//       })
//     );

//     const x$ = new Subject<ReadonlyAttribute>();
//     const y$ = new Subject<ReadonlyAttribute>();
//     const radius$ = new Subject<ReadonlyAttribute>();
//     const circleComponent = new CircleComponent(x$, y$, radius$);
//     circle$.next(circleComponent);
//     x$.next(new Attribute(new NumberExpr(0)));
//     y$.next(new Attribute(new NumberExpr(0)));
//     radius$.next(new Attribute(new NumberExpr(1)));

//     console.log(circles[0]);

//     // TODO: verify that the circles are correctly positioned
//   }
// }
