import type GoModule from "./utils/GoModule";
import ExprFactory from "./ExprFactory";
import Selection from "./utils/Selection";

export default class MainContext {
  public constructor(
    private goModule: GoModule,
    public readonly exprFactory: ExprFactory,
    public readonly selection: Selection,
  ) {
    exprFactory.onNumberExprCreated$().subscribe((numberExpr) => {
      goModule.addNumberExpr(numberExpr.id);
      numberExpr.value$.subscribe((value) => {
        goModule.setNumberExprValue(numberExpr.id, value);
      });
    });

    exprFactory.onCallExprCreated$().subscribe((callExpr) => {
      goModule.addCallExpr(callExpr.id);
      callExpr.args$.subscribe((args) => {
        args[0]!.subscribe((arg0) => {
          this.goModule.setCallExprArg0(callExpr.id, arg0.id);
        });

        args[1]!.subscribe((arg1) => {
          this.goModule.setCallExprArg1(callExpr.id, arg1.id);
        });
      });
    });
  }
}
