import type { NumberExpr } from '@/domain/Domain'

declare let window: any

export default class Evaluator {
  public static eval(expr: NumberExpr): number {
    const evaluator = GoModule.createEvaluator(expr)
    return evaluator.eval()
  }
}
