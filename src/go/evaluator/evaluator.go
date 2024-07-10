package evaluator

var logger = NewLogger("evaluator.go")

// -- TYPES --

type Float = float64

type Evaluator struct {
	ExprById map[string]*Expr
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
	arg0Id   string
	arg0Type string // "Value" or "Expr"
	arg1Id   string
	arg1Type string
}

func NewEvaluator() *Evaluator {
	return &Evaluator{
		ExprById: map[string]*Expr{},
	}
}

func (e *Evaluator) AddNumberExpr(id string) {
	e.ExprById[id] = &Expr{
		Id:         id,
		NumberExpr: &NumberExpr{},
	}
}

func (e *Evaluator) SetNumberExprValue(id string, value Float) {
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

func (e *Evaluator) AddCallExpr(id string) {
	e.ExprById[id] = &Expr{
		Id:       id,
		CallExpr: &CallExpr{},
	}
}

func (e *Evaluator) SetCallExprArg0(id string, argId string, argType string) {
	expr, found := e.ExprById[id]
	if !found {
		panic("expr not found")
	}
	callExpr := expr.CallExpr
	if callExpr == nil {
		panic("expr is not a call expr")
	}

	callExpr.arg0Id = argId
	callExpr.arg0Type = argType
}

func (e *Evaluator) SetCallExprArg1(id string, argId string, argType string) {
	expr, found := e.ExprById[id]
	if !found {
		panic("expr not found")
	}
	callExpr := expr.CallExpr
	if callExpr == nil {
		panic("expr is not a call expr")
	}

	callExpr.arg1Id = argId
	callExpr.arg1Type = argType
}

func (e *Evaluator) EvalExpr(exprId string) Float {
	expr, found := e.ExprById[exprId]
	if !found {
		panic("expr not found")
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
