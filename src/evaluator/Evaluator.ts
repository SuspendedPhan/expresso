import { Observable } from "rxjs";
import CircleComponent from "../domain/Component";

export interface EvaluatedCircleClone {
    x: number;
    y: number;
    radius: number;
}

export default class Evaluator {
    public constructor(private circle$: Observable<CircleComponent>) {}
    public evaluate$(): Observable<EvaluatedCircleClone[]> {
        throw new Error("Not implemented");
    }
}