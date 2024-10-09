// File: call_expr.go

package evaluator

type CallExpr struct {
	argIds     []string
	exFuncType string
	Evaluator  *Evaluator

	// Only on CustomExFuncs
	exFuncId string
}

func (e *Evaluator) CallExprCreate(id string) {
	e.ExprById[id] = &Expr{
		Id: id,
		CallExpr: &CallExpr{
			Evaluator: e,
		},
		Evaluator: e,
	}
}

func (e *Evaluator) CallExprSetArgs(id string, argIds []string) {
	expr, found := e.ExprById[id]
	if !found {
		panic("expr not found " + id)
	}
	callExpr := expr.CallExpr
	if callExpr == nil {
		panic("expr is not a call expr")
	}

	callExpr.argIds = argIds
}

func (e *Evaluator) CallExprSetExFuncType(id string, exFuncType string) {
	expr, found := e.ExprById[id]
	if !found {
		panic("expr not found")
	}
	callExpr := expr.CallExpr
	if callExpr == nil {
		panic("expr is not a call expr")
	}

	callExpr.exFuncType = exFuncType
}

func (e *Evaluator) CallExprSetExFunc(id string, exFuncId string) {
	expr, found := e.ExprById[id]
	if !found {
		panic("expr not found")
	}
	callExpr := expr.CallExpr
	if callExpr == nil {
		panic("expr is not a call expr")
	}

	callExpr.exFuncId = exFuncId
}

func (expr *CallExpr) Arg(index int) *Expr {
	argId := expr.argIds[index]
	arg, found := expr.Evaluator.ExprById[argId]
	if !found {
		panic("arg0 not found")
	}
	return arg
}

func (expr *CallExpr) ExFunc() *ExFunc {
	exFunc, found := expr.Evaluator.ExFuncById[expr.exFuncId]
	if !found {
		panic("exFunc not found")
	}
	return exFunc
}

func (expr *CallExpr) Args() []*Expr {
	args := make([]*Expr, len(expr.argIds))
	for i, argId := range expr.argIds {
		arg, found := expr.Evaluator.ExprById[argId]
		if !found {
			panic("arg not found")
		}
		args[i] = arg
	}
	return args
}
