package evaluator

func (e *Evaluator) AddCallExpr(id string) {
	e.ExprById[id] = &Expr{
		Id:       id,
		CallExpr: &CallExpr{},
	}
}

func (e *Evaluator) SetCallExprArg0(id string, argId string) {
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

func (e *Evaluator) SetCallExprArg1(id string, argId string) {
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
