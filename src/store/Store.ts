import { BehaviorSubject, Observable, map, delay, tap } from 'rxjs'

export default class Store {
  private value = new BehaviorSubject<number>(0)
  private result = this.value.pipe(
    delay(100),
    map((value) => this.eval(value))
  )

  public getValue(): Observable<number> {
    return this.value
  }

  public setValue(value: number): void {
    this.value.next(value)
  }

  public getResult(): Observable<number> {
    return this.result.pipe(tap(console.log))
  }

  private eval(value: number): number {
    console.log('eval', value)
    const evaluator = GoModule.createEvaluator({ Value: Number.parseFloat(value) })
    const r = evaluator.eval()
    return r
  }
}
