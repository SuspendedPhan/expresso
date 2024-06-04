import { BehaviorSubject, Observable } from 'rxjs'

export class Component {
  public id: string = 'component' + Math.random().toString(36).substring(7)
  private attributes = new BehaviorSubject<Array<Attribute>>([])

  public addAttribute() {
    this.attributes.value.push(new Attribute())
    this.attributes.next(this.attributes.value)
  }

  public getAttributes(): Observable<Array<Attribute>> {
    return this.attributes
  }
}

export class Attribute {
  public id: string = 'attribute' + Math.random().toString(36).substring(7)
  private expr = new BehaviorSubject<Expr>(new Expr())

  public getExpr(): Observable<Expr> {
    return this.expr
  }
}

export class Expr {
  public id: string = 'expr' + Math.random().toString(36).substring(7)
  public getText(): string {
    return '+'
  }
}
