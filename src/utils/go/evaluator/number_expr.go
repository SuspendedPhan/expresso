// File: number_expr.go

package evaluator

func (e *Evaluator) NumberExprCreate(id string) {
	e.ExprById[id] = &Expr{
		Id:         id,
		NumberExpr: &NumberExpr{},
	}
}

func (e *Evaluator) NumberExprSetValue(id string, value Float) {
	expr, found := e.ExprById[id]

	if !found {
		panic("expr not found")
	}
	numberExpr := expr.NumberExpr
	if numberExpr == nil {
		panic("expr is not a number expr")
	}

	numberExpr.Value = value
}
