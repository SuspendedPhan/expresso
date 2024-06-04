import { Component } from '@/domain/Domain'
import { BehaviorSubject, Observable } from 'rxjs'

export class ComponentStore {
  private components = new BehaviorSubject<Array<Component>>([])
  private count = new BehaviorSubject<number>(0)

  public addComponent() {
    this.components.value.push(new Component())
    this.components.next(this.components.value)
  }

  public getComponents(): Observable<Array<Component>> {
    return this.components.asObservable()
  }

  public getCount(): Observable<number> {
    return this.count.asObservable()
  }
  public incrementCount() {
    this.count.next(this.count.value + 1)
  }

  public eval() {
    // For each component, get its attributes, and for each attribute, get its expr
    for (const component of this.components.value) {
      for (const attribute of component.getAttributes().value) {
        attribute.getExpr().value.getText()
      }
    }

    GoModule.createEvaluator()
  }
}
