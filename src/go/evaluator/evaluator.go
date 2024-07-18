package evaluator

var logger = NewLogger("evaluator.go")

// -- TYPES --

type Float = float64

type Evaluator struct {
	RootComponentById map[string]*Component
	ExprById          map[string]*Expr
}

type Expr struct {
	Id         string
	NumberExpr *NumberExpr
	CallExpr   *CallExpr
}

type NumberExpr struct {
	Value Float
}

type CallExpr struct {
	arg0Id string
	arg1Id string
}

func NewEvaluator() *Evaluator {
	return &Evaluator{
		ExprById: map[string]*Expr{},
	}
}

func (e *Evaluator) EvalExpr(exprId string) Float {
	expr, found := e.ExprById[exprId]
	if !found {
		panic("expr not found " + exprId)
	}

	if expr.NumberExpr != nil {
		return expr.NumberExpr.Value
	}

	if expr.CallExpr != nil {
		arg0 := e.EvalExpr(expr.CallExpr.arg0Id)
		arg1 := e.EvalExpr(expr.CallExpr.arg1Id)
		return arg0 + arg1
	}

	panic("expr is neither a number expr nor a call expr")
}
