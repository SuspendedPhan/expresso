import { BehaviorSubject, Observable } from 'rxjs'
import Logger from './Logger'

const logger = Logger.topic('Domain.ts')

export class Attribute {
  
  private id = crypto.randomUUID()
  private expr$ : BehaviorSubject<Expr>;

  constructor(expr: Expr) {
    logger.log('Attribute constructor')
    expr.setParent(this)
    this.expr$ = new BehaviorSubject<Expr>(expr)
  }

  public setExpr(newExpr: Expr) {
    logger.log('setExpr', newExpr)
    newExpr.setParent(this)
    this.expr$.next(newExpr)
  }

  public getExpr$(): Observable<Expr> {
    return this.expr$
  }
  getId(): any {
    return this.id;
  }

  toString(): string {
    return JSON.stringify({
      id: this.id,
      expr: this.expr$.value.toString()
    });
  }
}

export abstract class Expr {
  private parent: CallExpr | Attribute = null
  private id = crypto.randomUUID()

  abstract getText(): string;
  abstract getExprType(): string;

  setParent(parent: CallExpr | Attribute) {
    this.parent = parent
  }

  replace(newExpr: Expr) {
    Logger.log('replacing', this, 'with', newExpr)
    if (!this.parent) {
      throw new Error('Expr has no parent')
    }
    
    if (this.parent instanceof Attribute) {
      this.parent.setExpr(newExpr)
    } else if (this.parent instanceof PrimitiveFunctionCallExpr) {
      this.parent.replaceArg(this, newExpr)
    } else {
      throw new Error('Unknown parent type')
    }
  }

  getId(): string {
    return this.id
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

  toString(): string {
    return this.getText();
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

  toString(): string {
    return JSON.stringify({
      id: this.getId(),
      args: this.args.value.map((arg) => arg.toString())
    });
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