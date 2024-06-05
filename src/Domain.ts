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
  private expr = new BehaviorSubject(new NumberExpr(0))

  public getExpr(): Observable<Expr> {
    return this.expr
  }
}

export interface Expr {
  getText(): string;
}

export class NumberExpr implements Expr {
  public id: string = 'numberExpr' + Math.random().toString(36).substring(7)
  private value: number

  constructor(value: number) {
    this.value = value
  }

  public getText(): string {
    return this.value.toString()
  }

  getValue(): number {
    return this.value
  }
}

export class PrimitiveFunctionCallExpr {
  public id: string = 'primitiveFunctionCallExpr' + Math.random().toString(36).substring(7)
  private args: BehaviorSubject<Array<Expr>>

  constructor(private primitiveFunctionId: string, args: Array<Expr>) {
    this.args = new BehaviorSubject(args)
  }

  public getPrimitiveFunctionId(): string {
    return this.primitiveFunctionId
  }

  public getText(): string {
    return this.primitiveFunctionId
  }

  public getArgs(): Observable<Array<Expr>> {
    return this.args
  }
}
