import { BehaviorSubject, Observable } from 'rxjs'

export default class Store {
  private result = new BehaviorSubject<number>(0)

  public setValue(value: number): void {
    const evaluator = GoModule.createEvaluator(value)
    const r = evaluator.eval()
    this.result.next(r)
  }

  public getResult(): Observable<number> {
    return this.result
  }
}
