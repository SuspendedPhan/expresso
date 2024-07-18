import {
  interval,
  Observable,
  Subject
} from "rxjs";
import MainContext from "../MainContext";
import { Evaluation } from "../utils/GoModule";

export class Evaluator {
  private eval$_ = new Subject<Evaluation>();
  
  public readonly eval$: Observable<Evaluation> = this.eval$_;

  public constructor(private readonly ctx: MainContext) {
    this.setup();
  }

  private setup() {
    interval(1000).subscribe(() => {
      const evaluation = this.ctx.goModule.Evaluator.eval();
      this.eval$_.next(evaluation);
      evaluation.dispose();
    });
  }
}
