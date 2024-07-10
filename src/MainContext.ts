import { BehaviorSubject, map, of, partition, switchAll, switchMap } from "rxjs";
import { CallExpr, Expr, NumberExpr } from "./domain/Expr";
import type GoModule from "./utils/GoModule";
import Selection from "./utils/Selection";

export default class MainContext {
  // public selection: Selection;

  public constructor(private goModule: GoModule) {
    // this.selection = new Selection(this.attribute);
  }

  public createNumberExpr(value: number): NumberExpr {
    const numberExpr: NumberExpr = new NumberExpr(value);
    this.goModule.addNumberExpr(numberExpr.id);
    numberExpr.value$.subscribe(value => {
      this.goModule.setNumberExprValue(numberExpr.id, value);
    });
    return numberExpr;
  }

  public createCallExpr(): CallExpr {
    const callExpr = new CallExpr();
    this.goModule.addCallExpr(callExpr.id);

    callExpr.args.subscribe(args => {
      const arg0Id = args[0]!.value.id;
      const arg0Type = `Value`;
      this.goModule.setCallExprArg0(callExpr.id, arg0Id, arg0Type);
      
      const arg1Id = args[1]!.value.id;
      const arg1Type = `Value`;
      this.goModule.setCallExprArg1(callExpr.id, arg1Id, arg1Type);
    });

    return callExpr;
  }
}
