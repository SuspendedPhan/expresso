import { BehaviorSubject, Observable } from 'rxjs'
import Logger from './Logger'

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

export abstract class Expr {
  private parent: CallExpr = null

  abstract getText(): string;
  abstract getExprType(): string;

  setParent(parent: CallExpr) {
    this.parent = parent
  }

  replace(newExpr: Expr) {
    Logger.log('replacing', this, 'with', newExpr)
    if (this.parent) {
      this.parent.replaceArg(this, newExpr)
    } else {
      throw new Error('Expr has no parent')
    }
  }
}

export class NumberExpr extends Expr {
  constructor(private value: number) {
    super();
  }

  public getText(): string {
    return this.value.toString()
  }

  getValue(): number {
    return this.value
  }

  getExprType(): string {
    return 'Number'
  }
}

export abstract class CallExpr extends Expr {
  private args: BehaviorSubject<Array<Expr>>

  constructor(args: Array<Expr>) {
    super();
    for (const arg of args) {
      arg.setParent(this);
    }
    this.args = new BehaviorSubject(args)
  }

  public getArgs$(): Observable<Array<Expr>> {
    return this.args
  }

  public getArgs(): Array<Expr> {
    return this.args.value
  }

  replaceArg(oldExpr: Expr, newExpr: Expr): void {
    const index = this.args.value.indexOf(oldExpr)
    if (index === -1) {
      throw new Error('oldExpr not found in args')
    }

    newExpr.setParent(this)
    this.args.value[index] = newExpr
    this.args.next(this.args.value)
  }
}

export class PrimitiveFunctionCallExpr extends CallExpr {
  constructor(args: Array<Expr>) {
    super(args)
  }
  getText(): string {
    return '+'
  }
  getExprType(): string {
    return 'PrimitiveFunctionCall'
  }
}