// File: call_expr.go

package evaluator

func (e *Evaluator) CallExprCreate(id string) {
	e.ExprById[id] = &Expr{
		Id: id,
		CallExpr: &CallExpr{
			Evaluator: e,
		},
		Evaluator: e,
	}
}

func (e *Evaluator) CallExprSetArg0(id string, argId string) {
	expr, found := e.ExprById[id]
	if !found {
		panic("expr not found")
	}
	callExpr := expr.CallExpr
	if callExpr == nil {
		panic("expr is not a call expr")
	}

	callExpr.arg0Id = argId
}

func (e *Evaluator) CallExprSetArg1(id string, argId string) {
	expr, found := e.ExprById[id]
	if !found {
		panic("expr not found " + id)
	}
	callExpr := expr.CallExpr
	if callExpr == nil {
		panic("expr is not a call expr")
	}

	callExpr.arg1Id = argId
}

func (expr *CallExpr) Arg0() *Expr {
	arg, found := expr.Evaluator.ExprById[expr.arg0Id]
	if !found {
		panic("arg0 not found")
	}
	return arg
}

func (expr *CallExpr) Arg1() *Expr {
	arg, found := expr.Evaluator.ExprById[expr.arg1Id]
	if !found {
		panic("arg1 not found")
	}
	return arg
}
