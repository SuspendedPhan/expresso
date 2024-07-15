import type GoModule from "./utils/GoModule";
import ExprFactory from "./ExObjectFactory";

export default class GoBridge {
  public constructor(
    goModule: GoModule,
    public readonly exprFactory: ExprFactory,
  ) {
    exprFactory.onNumberExprAdded$.subscribe((numberExpr) => {
      goModule.addNumberExpr(numberExpr.id);
      goModule.setNumberExprValue(numberExpr.id, numberExpr.value);
    });

    exprFactory.onCallExprAdded$.subscribe((callExpr) => {
      goModule.addCallExpr(callExpr.id);

      if (callExpr.args.length !== 2) {
        throw new Error("CallExpr must have 2 args");
      }

      callExpr.args[0]?.subscribe((arg0) => {
        goModule.setCallExprArg0(callExpr.id, arg0.id);
      });

      callExpr.args[1]?.subscribe((arg1) => {
        goModule.setCallExprArg1(callExpr.id, arg1.id);
      });
    });
  }
}
